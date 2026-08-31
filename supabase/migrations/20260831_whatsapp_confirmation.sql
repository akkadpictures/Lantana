-- LANTANA — WhatsApp order confirmation + complimentary Syrian delivery
-- Safe to run more than once.

-- 1. Origin IP, kept only so the checkout can throttle repeat submissions.
alter table orders add column if not exists ip text;

-- 2. Throttle lookups: "how many orders from this IP in the last hour".
create index if not exists orders_ip_created_idx on orders (ip, created_at desc);

-- 3. Existing unpaid orders were recorded as 'pending', which now means
--    "payment started". Move the ones that never had a payment rail into the
--    new resting state so the admin shows them correctly.
update orders
   set status = 'awaiting_confirmation'
 where status = 'pending'
   and payment_method in ('cod', 'bank_transfer', 'whatsapp');

-- 4. Delivery inside Syria is complimentary.
update shipping_rates
   set price_usd = 0,
       label = '{"en":"Damascus & Syria — complimentary courier","ar":"دمشق وسوريا — توصيل مجاني"}'::jsonb
 where country = 'SY';
