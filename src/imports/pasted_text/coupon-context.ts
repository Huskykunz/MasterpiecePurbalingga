PROMPT 1 — Membuat fitur kupon/kode promo:

Add a coupon/promo code feature to the checkout page. This must be built end-to-end: admin creates coupons, customer applies them at checkout, discount is reflected in the total. Follow the existing patterns in the codebase (context + localStorage, no backend needed).
Step 1 — Create CouponContext.tsx:
Create a new context file at src/app/context/CouponContext.tsx with the following:
Types for a Coupon object:
tsinterface Coupon {
  id: string;
  code: string;               // e.g. "DISKON10"
  type: "percentage" | "fixed"; // percentage = % off, fixed = flat Rp amount off
  value: number;              // e.g. 10 for 10% or 50000 for Rp 50.000
  minOrder: number;           // minimum subtotal required to use this coupon
  maxDiscount?: number;       // cap for percentage coupons (optional)
  expiresAt: string;          // ISO date string
  usageLimit: number;         // max total uses across all users
  usedCount: number;          // how many times it has been used
  isActive: boolean;
  createdAt: string;
}
Functions the context must expose:

coupons: Coupon[]
addCoupon(coupon: Omit<Coupon, "id" | "createdAt" | "usedCount">): void — for admin
deleteCoupon(id: string): void — for admin
toggleCoupon(id: string): void — activate/deactivate
validateCoupon(code: string, subtotal: number): { valid: boolean; coupon?: Coupon; error?: string } — checks if code exists, is active, not expired, not over usage limit, and subtotal meets minOrder
applyCoupon(code: string): void — increments usedCount
calculateDiscount(coupon: Coupon, subtotal: number): number — returns the discount amount (respects maxDiscount cap for percentage type)

Persist all coupons to localStorage key "coupons". Wrap the app with CouponProvider in App.tsx or Root.tsx wherever other providers are wrapped.

Step 2 — Add coupon input to Checkout.tsx:
Add a coupon input section between the payment method section and the order summary total. It should:

Have a text input for the coupon code and an "Pakai" button
On click, call validateCoupon(code, subtotal)
If invalid, show a toast.error() with the error message
If valid, show a green success state below the input showing the coupon name and discount amount
Allow removing the applied coupon (show an X button)
Update the order summary to show a new "Diskon Kupon" line item with the discount amount in green
Deduct the discount from the total: finalTotal = total - discountAmount (minimum 0)
When handleSubmit is called, also call applyCoupon(code) to increment usedCount
Pass finalTotal (not total) to createOrder()


Step 3 — Add coupon management to AdminDashboard.tsx:
Add a new "Kupon" tab in the admin dashboard (alongside existing tabs). The tab must contain:

A form to create a new coupon with fields: kode, tipe (percentage/fixed), nilai diskon, minimal order, maks diskon (only shown if type is percentage), tanggal kadaluarsa, batas pemakaian, status aktif
A table/list of all existing coupons showing: code, type, value, minOrder, expiry, usedCount/usageLimit, status active/inactive
Delete button per coupon
Toggle active/inactive button per coupon

Show the complete code for all new and modified files. Do not break any existing functionality.


PROMPT 2 — Menambahkan voucher/kupon default bawaan:

After the CouponContext is set up, add default seed coupons so the app has built-in vouchers from the start. In CouponContext.tsx, add a seed function that runs on first load (use a version key in localStorage like "couponSeedVersion": "v1" to prevent re-seeding).
Seed the following default coupons into localStorage if they don't already exist:
1. Code: WELCOME10
   Type: percentage
   Value: 10%
   Min order: Rp 50.000
   Max discount: Rp 30.000
   Expires: 1 year from now
   Usage limit: 1000
   Active: true
   Description: Diskon 10% untuk pelanggan baru

2. Code: HEMAT25K
   Type: fixed
   Value: Rp 25.000
   Min order: Rp 100.000
   Expires: 6 months from now
   Usage limit: 500
   Active: true
   Description: Potongan Rp 25.000 untuk pembelian di atas Rp 100.000

3. Code: GRATIS50
   Type: fixed
   Value: Rp 50.000
   Min order: Rp 200.000
   Expires: 3 months from now
   Usage limit: 200
   Active: true
   Description: Potongan Rp 50.000 untuk pembelian di atas Rp 200.000

4. Code: DISKON20
   Type: percentage
   Value: 20%
   Min order: Rp 150.000
   Max discount: Rp 75.000
   Expires: 2 months from now
   Usage limit: 100
   Active: true
   Description: Diskon 20% maksimal Rp 75.000

5. Code: MASTERPIECE
   Type: percentage
   Value: 15%
   Min order: Rp 75.000
   Max discount: Rp 50.000
   Expires: 1 year from now
   Usage limit: 9999
   Active: true
   Description: Kode spesial Masterpiece — bisa dipakai kapan saja
The seed function must:

Generate a proper id for each coupon using Date.now() + index or a static string id like "seed-1", "seed-2" etc.
Set usedCount: 0 and createdAt: new Date().toISOString() for all seed coupons
Only run once — check localStorage.getItem("couponSeedVersion") === "v1" before seeding
Merge with any existing coupons already in localStorage (do not overwrite user-created coupons)
After seeding, set localStorage.setItem("couponSeedVersion", "v1")

Show the complete updated CouponContext.tsx with the seed function included. Do not change any other file.