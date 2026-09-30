-- PayTR (kredi kartı) ödeme altyapısı + mesafeli satış mevzuatı gereği zorunlu sayfalar
-- Bunu Supabase Dashboard > SQL Editor içine yapıştırıp çalıştırın (001-015'ten sonra).
--
-- ÖNEMLİ: Aşağıdaki içerik sayfalarında [KÖŞELİ PARANTEZ] ile işaretli yerler
-- şirket kurulduktan sonra admin panelinden (Ayarlar > Sayfalar) gerçek bilgilerle
-- doldurulmalıdır. Bu metinler standart bir başlangıç şablonudur, yayına almadan
-- önce bir hukuk danışmanına kontrol ettirmeniz önerilir.

-- ============ ORDERS: ÖDEME DURUMU + PAYTR ALANLARI ============

alter table public.orders
  drop constraint if exists orders_payment_method_check;
alter table public.orders
  add constraint orders_payment_method_check
  check (payment_method in ('kapida_odeme', 'havale', 'kredi_karti'));

alter table public.orders
  add column if not exists payment_status text not null default 'beklemede'
    check (payment_status in ('beklemede', 'odendi', 'basarisiz')),
  add column if not exists paytr_merchant_oid text unique,
  add column if not exists terms_accepted_at timestamptz;

create index if not exists orders_paytr_merchant_oid_idx on public.orders (paytr_merchant_oid);

-- ============ create_order: sözleşme onayı zorunlu + paytr_merchant_oid üretimi ============

drop function if exists public.create_order(text, uuid, text, text, text, text, text, jsonb, text);

create or replace function public.create_order(
  p_order_number text,
  p_customer_id uuid,
  p_guest_name text,
  p_guest_email text,
  p_guest_phone text,
  p_shipping_address text,
  p_payment_method text,
  p_items jsonb,
  p_discount_code text default null,
  p_terms_accepted boolean default false
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
  v_item jsonb;
  v_product public.products;
  v_quantity int;
  v_subtotal numeric := 0;
  v_line_total numeric;
  v_shipping public.shipping_settings;
  v_shipping_fee numeric := 0;
  v_promo public.promo_popup_settings;
  v_discount_amount numeric := 0;
  v_prior_orders int;
  v_merchant_oid text;
begin
  if not p_terms_accepted then
    raise exception 'Mesafeli Satış Sözleşmesi onaylanmadan sipariş oluşturulamaz';
  end if;

  if jsonb_array_length(p_items) = 0 then
    raise exception 'Sepet boş';
  end if;

  for v_item in select * from jsonb_array_elements(p_items) loop
    select * into v_product
    from public.products
    where id = (v_item->>'product_id')::uuid
    for update;

    if v_product.id is null then
      raise exception 'Ürün bulunamadı (sepetinizdeki bir ürün artık mevcut değil). Lütfen sepetinizi güncelleyip tekrar deneyin.';
    end if;

    v_quantity := (v_item->>'quantity')::int;

    if v_product.stock < v_quantity then
      raise exception '"%" için yeterli stok yok (stokta % adet var)', v_product.name, v_product.stock;
    end if;

    v_subtotal := v_subtotal + v_product.price * v_quantity;
  end loop;

  select * into v_shipping from public.shipping_settings where id = 1;
  if v_shipping.id is not null and v_subtotal < v_shipping.free_shipping_threshold then
    v_shipping_fee := v_shipping.standard_shipping_fee;
  end if;

  if p_discount_code is not null and length(trim(p_discount_code)) > 0 then
    select * into v_promo from public.promo_popup_settings where id = 1;

    if v_promo.id is null or not v_promo.enabled
       or lower(trim(v_promo.discount_code)) <> lower(trim(p_discount_code)) then
      raise exception 'Geçersiz indirim kodu';
    end if;

    if p_customer_id is null then
      raise exception 'Bu indirim kodu yalnızca üye girişi yapan müşteriler için geçerlidir';
    end if;

    select count(*) into v_prior_orders from public.orders where customer_id = p_customer_id;
    if v_prior_orders > 0 then
      raise exception 'Bu indirim kodu yalnızca ilk siparişinizde geçerlidir';
    end if;

    v_discount_amount := round(v_subtotal * v_promo.discount_percent / 100, 2);
  end if;

  -- PayTR merchant_oid yalnızca harf/rakam kabul eder — sipariş numarasındaki
  -- tireler ayıklanarak üretilir (örn. VRS-1A2B-C3D4 -> VRS1A2BC3D4).
  v_merchant_oid := regexp_replace(p_order_number, '[^A-Za-z0-9]', '', 'g');

  insert into public.orders (
    order_number, customer_id, guest_name, guest_email, guest_phone,
    shipping_address, payment_method, subtotal, shipping_fee,
    discount_code, discount_amount, total, paytr_merchant_oid, terms_accepted_at
  )
  values (
    p_order_number, p_customer_id, p_guest_name, p_guest_email, p_guest_phone,
    p_shipping_address, p_payment_method, v_subtotal, v_shipping_fee,
    nullif(trim(coalesce(p_discount_code, '')), ''), v_discount_amount,
    v_subtotal + v_shipping_fee - v_discount_amount, v_merchant_oid, now()
  )
  returning * into v_order;

  for v_item in select * from jsonb_array_elements(p_items) loop
    select * into v_product from public.products where id = (v_item->>'product_id')::uuid;
    v_quantity := (v_item->>'quantity')::int;
    v_line_total := v_product.price * v_quantity;

    insert into public.order_items (
      order_id, product_id, product_name, product_slug, unit_price, quantity, line_total
    )
    values (
      v_order.id, v_product.id, v_product.name, v_product.slug, v_product.price, v_quantity, v_line_total
    );

    update public.products set stock = stock - v_quantity where id = v_product.id;
  end loop;

  return v_order;
end;
$$;

grant execute on function public.create_order(text, uuid, text, text, text, text, text, jsonb, text, boolean) to anon, authenticated;

-- ============ PAYTR WEBHOOK: ödeme sonucu + stok iadesi (başarısızsa) ============
-- Bu fonksiyon yalnızca /api/paytr/callback route'u tarafından, PayTR imzası
-- (hash) doğrulandıktan SONRA, servis rolü ile çağrılır.

create or replace function public.paytr_mark_payment(
  p_merchant_oid text,
  p_success boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
  v_item record;
begin
  select * into v_order from public.orders where paytr_merchant_oid = p_merchant_oid for update;

  if v_order.id is null then
    raise exception 'Sipariş bulunamadı: %', p_merchant_oid;
  end if;

  -- Webhook birden fazla kez tetiklenebilir — zaten işlenmiş siparişe dokunma.
  if v_order.payment_status <> 'beklemede' then
    return;
  end if;

  if p_success then
    update public.orders
    set payment_status = 'odendi',
        status = case when status = 'beklemede' then 'onaylandi' else status end
    where id = v_order.id;
  else
    update public.orders
    set payment_status = 'basarisiz',
        status = 'iptal'
    where id = v_order.id;

    -- Ödeme başarısız olduysa, sipariş oluşturulurken düşülen stoklar geri eklenir.
    for v_item in select product_id, quantity from public.order_items where order_id = v_order.id loop
      if v_item.product_id is not null then
        update public.products set stock = stock + v_item.quantity where id = v_item.product_id;
      end if;
    end loop;
  end if;
end;
$$;

-- ============ MESAFELİ SATIŞ MEVZUATI: içerik sayfaları ============

insert into public.content_pages (slug, title, body) values
(
  'mesafeli-satis-sozlesmesi',
  'Mesafeli Satış Sözleşmesi',
  $body$MADDE 1 - TARAFLAR

SATICI:
Unvan: [ŞİRKET UNVANI]
Adres: [ADRES]
Vergi Dairesi / No: [VERGİ DAİRESİ VE NUMARASI]
Mersis No: [MERSİS NO]
Telefon: [TELEFON]
E-posta: [E-POSTA]

ALICI:
Sipariş sırasında bildirilen ad-soyad, adres, telefon ve e-posta bilgileri esas alınır.

MADDE 2 - KONU

İşbu sözleşmenin konusu, ALICI'nın SATICI'ya ait internet sitesi üzerinden elektronik ortamda
siparişini verdiği aşağıda nitelikleri ve satış fiyatı belirtilen ürünün satışı ve teslimi ile
ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler
Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin belirlenmesidir.

MADDE 3 - SÖZLEŞME KONUSU ÜRÜN, ÖDEME VE TESLİMAT BİLGİLERİ

Ürünün cinsi, türü, miktarı, marka/modeli, satış bedeli (KDV dahil), ödeme şekli ve teslim
edilecek kişi/adres bilgileri, ALICI'nın internet sitesi üzerinden verdiği sipariş ve bu
siparişe ait sipariş onay e-postasında/sipariş özeti sayfasında yer alan bilgilerdir; bu
bilgiler işbu sözleşmenin ayrılmaz bir parçasıdır.

Ödeme; kapıda ödeme, banka havalesi/EFT veya SATICI'nın anlaşmalı olduğu ödeme kuruluşu
(PayTR) aracılığıyla kredi/banka kartı ile yapılabilir. Kredi kartı ile yapılan ödemelerde
kart bilgileri SATICI tarafından görülmez ve saklanmaz; ödeme, PayTR'nin PCI-DSS uyumlu
güvenli ödeme altyapısı üzerinden gerçekleştirilir.

MADDE 4 - GENEL HÜKÜMLER

4.1. ALICI, internet sitesinde sözleşme konusu ürünün temel nitelikleri, satış fiyatı ve
ödeme şekli ile teslimata ilişkin ön bilgileri okuyup bilgi sahibi olduğunu ve elektronik
ortamda gerekli teyidi verdiğini beyan eder.

4.2. Sözleşme konusu ürün, yasal 30 günlük süreyi aşmamak koşulu ile her bir ürün için
ALICI'nın yerleşim yerinin uzaklığına bağlı olarak internet sitesinde ön bilgiler içinde
açıklanan süre içinde ALICI veya gösterdiği adresteki kişi/kuruluşa teslim edilir.

4.3. SATICI, sözleşme konusu ürünün sağlam, eksiksiz, siparişte belirtilen niteliklere uygun
ve varsa garanti belgeleri ile teslim edilmesinden sorumludur.

4.4. Ürünün teslimatı sonrasında ALICI'ya ait kredi kartının yetkisiz kişilerce haksız
kullanılması sonucu ilgili banka veya kart çıkaran kuruluşun ürün bedelini SATICI'ya ödememesi
halinde, ALICI'nın kendisine teslim edilmiş olması kaydıyla ürünün 3 gün içinde SATICI'ya
gönderilmesi zorunludur.

MADDE 5 - CAYMA HAKKI

ALICI; sözleşme konusu ürünün kendisine veya gösterdiği adresteki kişi/kuruluşa tesliminden
itibaren 14 (on dört) gün içinde, hiçbir gerekçe göstermeksizin ve cezai şart ödemeksizin
sözleşmeden cayma hakkına sahiptir. Cayma hakkının kullanılması için bu süre içinde SATICI'ya
[E-POSTA] adresi veya [TELEFON] numarası üzerinden bildirimde bulunulması yeterlidir.

Cayma hakkının kullanılması halinde ürünün, faturası ile birlikte, kullanılmamış ve
ambalajı/etiketleri bozulmamış şekilde 10 gün içinde SATICI'ya gönderilmesi gerekir. Cayma
bildiriminin SATICI'ya ulaşmasından itibaren en geç 14 gün içinde ürün bedeli ALICI'ya
ödemeyi yaptığı yöntemle (kredi kartına iade veya havale) geri ödenir.

MADDE 6 - CAYMA HAKKININ KULLANILAMAYACAĞI ÜRÜNLER

6502 sayılı Kanun'un 15. maddesi ve ilgili yönetmelik uyarınca; ALICI'nın istekleri veya
kişisel ihtiyaçları doğrultusunda hazırlanan (örneğin isim/tarih gravürü işlenmiş, kişiye
özel üretilen) ürünlerde ve tek kullanımlık/hijyenik ürünlerde, ambalajı açılmış olması
halinde cayma hakkı kullanılamaz. Bu istisna kapsamındaki ürünler, ürün sayfasında ve sipariş
öncesinde ALICI'ya ayrıca bildirilir.

MADDE 7 - TEMERRÜT HÜKÜMLERİ VE UYUŞMAZLIKLARIN ÇÖZÜMÜ

ALICI'nın, kredi kartı ile yaptığı ödemelerde temerrüde düşmesi halinde kart sahibi banka ile
arasındaki kredi kartı sözleşmesi hükümleri uygulanır. İşbu sözleşmenin uygulanmasından doğan
uyuşmazlıklarda, Ticaret Bakanlığı'nca yıllık olarak açıklanan parasal sınırlar dahilinde
ALICI'nın yerleşim yerindeki İl/İlçe Tüketici Hakem Heyetleri, aşan durumlarda ise Tüketici
Mahkemeleri yetkilidir.

MADDE 8 - YÜRÜRLÜK

ALICI, internet sitesi üzerinden siparişini onaylayarak ve/veya ödemeyi gerçekleştirerek işbu
sözleşmenin tüm koşullarını kabul etmiş sayılır.

Son güncelleme: [GÜNCELLEME TARİHİ]$body$
),
(
  'on-bilgilendirme-formu',
  'Ön Bilgilendirme Formu',
  $body$Bu form, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler
Yönetmeliği uyarınca, sipariş onaylanmadan önce ALICI'nın bilgilendirilmesi amacıyla
hazırlanmıştır.

SATICI BİLGİLERİ
Unvan: [ŞİRKET UNVANI]
Adres: [ADRES]
Telefon: [TELEFON]
E-posta: [E-POSTA]

ÜRÜN VE SİPARİŞ BİLGİLERİ
Satın almak istediğiniz ürünün temel nitelikleri (isim, görsel, açıklama), adedi, birim fiyatı,
varsa kargo ücreti ve toplam tutarı, ödeme adımına geçmeden önce sepet ve ödeme sayfasında KDV
dahil olarak gösterilir.

ÖDEME ŞEKLİ
Kapıda ödeme, banka havalesi/EFT veya PayTR güvenli ödeme altyapısı ile kredi/banka kartı.

TESLİMAT
Siparişler, stok durumuna göre [TESLİMAT SÜRESİ, örn. 1-3 iş günü] içinde kargoya teslim
edilir; yasal azami teslim süresi 30 gündür. Teslimat gideri, sepet tutarı [KARGO ÜCRETİ /
ÜCRETSİZ KARGO LİMİTİ] belirlenen tutarın altında kaldığında ALICI'ya aittir.

CAYMA HAKKI
ALICI, teslimden itibaren 14 gün içinde gerekçe göstermeksizin cayma hakkına sahiptir; kişiye
özel (gravürlü vb.) üretilen ürünlerde bu hak kullanılamaz. Ayrıntılar için Mesafeli Satış
Sözleşmesi ve İade & Değişim sayfalarına bakınız.

ŞİKAYET VE İTİRAZLAR
ALICI, şikayet ve itirazlarını yerleşim yerindeki İl/İlçe Tüketici Hakem Heyeti'ne veya
Tüketici Mahkemesi'ne iletebilir.

ALICI, sipariş onayı ile birlikte işbu ön bilgilendirme formunu okuduğunu ve anladığını kabul
eder.

Son güncelleme: [GÜNCELLEME TARİHİ]$body$
)
on conflict (slug) do update set
  title = excluded.title,
  body = excluded.body,
  updated_at = now()
where public.content_pages.body = 'İçerik yakında eklenecek.';

-- Zaten var olan ama placeholder içerikli sayfaları gerçek metinle güncelle
-- (yalnızca admin panelinden hiç düzenlenmemiş, hâlâ "yakında eklenecek" olanlar değişir).

update public.content_pages set body = $body$Kargo Ücreti ve Süresi

Siparişleriniz, [TESLİMAT SÜRESİ, örn. 1-3 iş günü] içinde anlaşmalı kargo firmasına teslim
edilir. Sepet tutarınız [ÜCRETSİZ KARGO LİMİTİ] TL ve üzerindeyse kargo ücretsizdir; altında
ise sabit [KARGO ÜCRETİ] TL kargo ücreti uygulanır (güncel tutarlar sepet/ödeme sayfasında
gösterilir).

Siparişiniz kargoya verildiğinde, kayıtlı e-posta adresinize ve "Siparişlerim" sayfanıza
kargo firması ve takip numarası bilgisi işlenir.

Teslimat sırasında ürün ambalajında hasar görürseniz, teslim almadan önce kargo görevlisine
tutanak tutturmanızı ve bizimle [E-POSTA] üzerinden iletişime geçmenizi rica ederiz.

Yasal azami teslim süresi (Mesafeli Sözleşmeler Yönetmeliği uyarınca) 30 gündür.$body$,
updated_at = now()
where slug = 'kargo-teslimat' and body = 'İçerik yakında eklenecek.';

update public.content_pages set body = $body$Cayma Hakkı

Ürünlerimizi, teslim tarihinden itibaren 14 (on dört) gün içinde, kullanılmamış ve
ambalajı/etiketleri bozulmamış olması koşuluyla, hiçbir gerekçe göstermeksizin iade
edebilirsiniz. Cayma hakkınızı kullanmak için [E-POSTA] adresinden veya [TELEFON]
numarasından bizimle iletişime geçmeniz yeterlidir.

İsim/tarih gravürü gibi kişiye özel olarak hazırlanan ürünlerde, 6502 sayılı Kanun m.15
gereği cayma hakkı bulunmamaktadır.

İade Süreci
1. [E-POSTA] adresine sipariş numaranızla birlikte iade talebinizi iletin (üyeyseniz
   "Siparişlerim" sayfasından da iade talebi oluşturabilirsiniz).
2. Talebiniz onaylandıktan sonra ürünü orijinal ambalajı ve faturasıyla birlikte
   bildirilen adrese gönderin.
3. Ürün elimize ulaşıp kontrol edildikten sonra, bedeli en geç 14 gün içinde ödemeyi
   yaptığınız yönteme (kredi kartına iade veya banka hesabınıza havale) iade edilir.

Değişim
Beden/renk değişimi talepleriniz için ürünü iade sürecindeki gibi bize ulaştırmanız,
yerine göndereceğimiz ürünün stok durumuna göre değişim işlemi tamamlanır.

Ayrıntılı yasal metin için Mesafeli Satış Sözleşmesi sayfamıza bakabilirsiniz.$body$,
updated_at = now()
where slug = 'iade-degisim' and body = 'İçerik yakında eklenecek.';

update public.content_pages set body = $body$Kişisel Verilerin Korunması (KVKK) Aydınlatma Metni

[ŞİRKET UNVANI] ("Şirket") olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK")
kapsamında veri sorumlusu sıfatıyla, sitemiz üzerinden topladığımız kişisel verilerinizin
işlenmesine ilişkin sizleri bilgilendirmek isteriz.

Toplanan Veriler
Ad-soyad, adres, telefon, e-posta, sipariş ve ödeme bilgileri (kart bilgileriniz tarafımızca
saklanmaz; ödemeler PayTR'nin güvenli altyapısı üzerinden işlenir), site kullanım/çerez
verileri.

İşleme Amaçları
Siparişlerinizin alınması, teslimatın yapılması, faturalandırma, müşteri hizmetleri,
yasal yükümlülüklerin yerine getirilmesi, izniniz olması halinde kampanya/bülten
bilgilendirmeleri.

Aktarım
Kişisel verileriniz; kargo firmaları, ödeme kuruluşu (PayTR) ve yasal olarak yetkili kamu
kurumları ile, yalnızca hizmetin ifası için gerekli olduğu ölçüde paylaşılır.

Haklarınız
KVKK m.11 uyarınca; verilerinizin işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin
bilgi talep etme, düzeltilmesini veya silinmesini isteme haklarına sahipsiniz. Taleplerinizi
[E-POSTA] adresine iletebilirsiniz.

Gizlilik Politikası

Kişisel bilgileriniz, açık rızanız veya yasal bir dayanak olmadan üçüncü kişilerle
paylaşılmaz. Sitemizdeki tüm ödeme işlemleri SSL ile şifrelenir; kart bilgileriniz
sunucularımızda tutulmaz, doğrudan PayTR'nin PCI-DSS uyumlu altyapısında işlenir.

Son güncelleme: [GÜNCELLEME TARİHİ]$body$,
updated_at = now()
where slug = 'gizlilik' and body = 'İçerik yakında eklenecek.';

update public.content_pages set body = $body$Kullanım Şartları

1. Bu internet sitesi [ŞİRKET UNVANI] ("Şirket") tarafından işletilmektedir. Siteyi
   kullanarak aşağıdaki şartları kabul etmiş sayılırsınız.

2. Sitede yer alan tüm görsel ve yazılı içerikler Şirket'e aittir; izinsiz kopyalanamaz
   ve ticari amaçla kullanılamaz.

3. Ürün görselleri temsili olabilir; bir kısmı yapay zeka ile oluşturulmuş veya
   iyileştirilmiştir. Gerçek ürün, ışık ve ekran farklarına bağlı olarak görselden
   hafif farklılık gösterebilir.

4. Üyelik bilgilerinizin (e-posta, şifre) gizliliğinden ve hesabınız üzerinden yapılan
   işlemlerden siz sorumlusunuz.

5. Şirket, stok/fiyat hatalarını fark ettiği siparişleri, müşteriyi bilgilendirerek iptal
   etme hakkını saklı tutar.

6. Bu şartlarla ilgili uyuşmazlıklarda Türkiye Cumhuriyeti kanunları uygulanır.

Son güncelleme: [GÜNCELLEME TARİHİ]$body$,
updated_at = now()
where slug = 'kullanim-sartlari' and body = 'İçerik yakında eklenecek.';

update public.content_pages set body = $body$Çerez (Cookie) Politikası

Sitemiz; oturumunuzu açık tutmak, sepetinizi hatırlamak, güvenliği sağlamak ve site
kullanımını analiz etmek amacıyla çerezler kullanır.

Kullandığımız Çerez Türleri
- Zorunlu çerezler: Oturum açma, sepet ve ödeme adımlarının çalışması için gereklidir,
  kapatılamaz.
- Tercih çerezleri: Dil/görünüm tercihlerinizi hatırlamak için kullanılır.
- Analitik çerezler: Site trafiğini anlamak için (varsa) kullanılır.

Çerezleri, tarayıcı ayarlarınızdan istediğiniz zaman silebilir veya engelleyebilirsiniz;
ancak zorunlu çerezleri engellemeniz halinde sitenin bazı bölümleri (sepet, ödeme gibi)
düzgün çalışmayabilir.

Son güncelleme: [GÜNCELLEME TARİHİ]$body$,
updated_at = now()
where slug = 'cerez-tercihleri' and body = 'İçerik yakında eklenecek.';

update public.content_pages set body = $body$[ŞİRKET UNVANI]

Adres: [ADRES]
Telefon: [TELEFON]
E-posta: [E-POSTA]

Müşteri hizmetlerimize hafta içi [ÇALIŞMA SAATLERİ] arasında ulaşabilirsiniz.$body$,
updated_at = now()
where slug = 'iletisim' and body = 'İçerik yakında eklenecek.';
