// ===== COUPON SYSTEM (mirrors db/coupons table) =====
const coupons = [
  {code:'WELCOME50',desc:'50% OFF up to ₹100',type:'percent',value:50,min:0,max:100},
  {code:'FREEDEL',desc:'Free delivery above ₹199',type:'flat',value:40,min:199,max:null},
  {code:'UPI20',desc:'20% cashback (UPI only)',type:'percent',value:20,min:0,max:80},
  {code:'FLAT125',desc:'Flat ₹125 OFF above ₹499',type:'flat',value:125,min:499,max:null}
];
let appliedCoupon = localStorage.getItem('foodie_coupon') || null;
if(appliedCoupon && !coupons.find(c=>c.code===appliedCoupon)) appliedCoupon=null;

function getCoupon(code){ return coupons.find(c=>c.code===code.toUpperCase()); }

function calcTotals(){
  const subtotal = cartTotal();
  const delivery = subtotal>0 ? 40 : 0;
  const tax = Math.round(subtotal*0.05);
  let discount = 0;
  const c = appliedCoupon ? getCoupon(appliedCoupon) : null;
  if(c && subtotal>0 && subtotal>=c.min){
    if(c.type==='percent'){ discount = Math.round(subtotal*c.value/100); if(c.max) discount = Math.min(discount, c.max); }
    else { discount = c.value; }
    if(c.code==='UPI20' && selectedPay!=='upi') discount=0;
    discount = Math.min(discount, subtotal+delivery);
  }
  const total = Math.max(0, subtotal+delivery+tax-discount);
  return {subtotal,delivery,tax,discount,total,c};
}

function renderCouponChips(containerId){
  const el=document.getElementById(containerId);
  if(!el) return;
  el.innerHTML = coupons.map(c=>`<span class="coupon-chip" data-code="${c.code}" title="${c.desc}">${c.code}</span>`).join('');
  el.querySelectorAll('.coupon-chip').forEach(ch=>{
    ch.addEventListener('click',()=>{ applyCouponCode(ch.dataset.code, ch.closest('.coupon-section').id.startsWith('cart')?'cart':'checkout'); });
  });
}

function applyCouponCode(rawCode, source){
  const code = (rawCode||'').trim().toUpperCase();
  const msgId = source==='cart' ? 'cartCouponMsg' : 'checkoutCouponMsg';
  const msg = document.getElementById(msgId);
  const coupon = getCoupon(code);
  const {subtotal} = calcTotals();
  if(!code){ if(msg){msg.textContent='Enter a code';msg.className='coupon-msg error';} return; }
  if(!coupon){ if(msg){msg.textContent='Invalid coupon code';msg.className='coupon-msg error';} return; }
  if(subtotal===0){ if(msg){msg.textContent='Add items to cart first';msg.className='coupon-msg error';} return; }
  if(subtotal < coupon.min){ if(msg){msg.textContent='Minimum order ₹'+coupon.min+' required';msg.className='coupon-msg error';} return; }
  if(coupon.code==='UPI20' && selectedPay!=='upi'){ if(msg){msg.textContent='Switch payment to UPI to use this coupon';msg.className='coupon-msg error';} return; }
  appliedCoupon = coupon.code;
  localStorage.setItem('foodie_coupon', appliedCoupon);
  if(msg){msg.textContent=coupon.code+' applied! '+coupon.desc; msg.className='coupon-msg success';}
  renderCouponUI();
  renderCart();
  renderCheckoutSummary();
}

function removeCoupon(){
  appliedCoupon=null;
  localStorage.removeItem('foodie_coupon');
  const m1=document.getElementById('cartCouponMsg'); if(m1){m1.textContent='Coupon removed';m1.className='coupon-msg';}
  const m2=document.getElementById('checkoutCouponMsg'); if(m2){m2.textContent='';m2.className='coupon-msg';}
  renderCouponUI();
  renderCart();
  renderCheckoutSummary();
}

function renderCouponUI(){
  const cartApplied = document.getElementById('cartAppliedCoupon');
  const cartCode = document.getElementById('cartAppliedCode');
  const cartInput = document.getElementById('cartCouponInput');
  if(cartApplied){
    if(appliedCoupon){ cartApplied.style.display='flex'; if(cartCode) cartCode.textContent=appliedCoupon; if(cartInput) cartInput.value=appliedCoupon; }
    else { cartApplied.style.display='none'; if(cartInput) cartInput.value=''; }
  }
  const coApplied = document.getElementById('checkoutAppliedCoupon');
  const coCode = document.getElementById('checkoutAppliedCode');
  const coInput = document.getElementById('checkoutCouponInput');
  if(coApplied){
    if(appliedCoupon){ coApplied.style.display='flex'; if(coCode) coCode.textContent=appliedCoupon; if(coInput) coInput.value=appliedCoupon; }
    else { coApplied.style.display='none'; if(coInput) coInput.value=''; }
  }
  renderCouponChips('cartCouponChips');
}

function renderCheckoutSummary(){
  const {subtotal,delivery,tax,discount,total} = calcTotals();
  const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent='₹'+v;};
  set('coItemTotal',subtotal); set('coDelFee',delivery); set('coTaxes',tax); set('coGrandTotal',total);
  const dr=document.getElementById('coDiscountRow');
  if(dr){ dr.style.display = discount>0?'flex':'none'; const a=document.getElementById('coDiscountAmt'); if(a) a.textContent='₹'+discount; }
}

// ===== THEME TOGGLE =====
const themeToggle=document.getElementById('themeToggle');
function applyTheme(t){
  document.documentElement.classList.toggle('dark', t==='dark');
  if(themeToggle) themeToggle.textContent = t==='dark'?'☀️':'🌙';
  localStorage.setItem('foodie_theme',t);
}
const savedTheme=localStorage.getItem('foodie_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
applyTheme(savedTheme);
if(themeToggle) themeToggle.addEventListener('click',()=>applyTheme(document.documentElement.classList.contains('dark')?'light':'dark'));

// ===== SKELETON RENDER =====
function renderSkeletons(n=8){
  const grid=document.getElementById('restGrid');
  grid.innerHTML=Array.from({length:n}).map(()=>`
    <div class="sk-card">
      <div class="skeleton sk-img"></div>
      <div class="sk-body">
        <div class="skeleton sk-line w60"></div>
        <div class="skeleton sk-line w80"></div>
        <div class="sk-meta"><div class="skeleton sk-pill"></div><div class="skeleton sk-pill"></div><div class="skeleton sk-pill"></div></div>
      </div>
    </div>
  `).join('');
}

// Override initial render with skeleton delay
const _origRender=renderRestaurants;
function renderRestaurantsWithSkeleton(){
  renderSkeletons();
  setTimeout(()=>_origRender(), 450);
}
// replace calls: redefine renderRestaurants wrapper
const __renderRestaurants = renderRestaurants;
window.renderRestaurants = function(){ renderSkeletons(); setTimeout(__renderRestaurants, 350); };

// ===== REVEAL ON SCROLL =====
const io=new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} });
},{threshold:0.12});
function observeReveals(){ document.querySelectorAll('.reveal').forEach(el=>io.observe(el)); }

// ===== CART BADGE PULSE =====
const _origUpdateBadge=updateCartBadge;
updateCartBadge=function(){ _origUpdateBadge(); const b=document.getElementById('cartCount'); if(b){ b.classList.remove('pulse'); void b.offsetWidth; b.classList.add('pulse'); } };

// ===== CONFETTI ON ORDER =====
const _origPlaceOrder=placeOrder;
placeOrder=function(){
  _origPlaceOrder();
  // confetti after success screen opens
  setTimeout(()=>{
    if(typeof confetti==='function'){
      const canvas=document.getElementById('confetti-canvas');
      const myConfetti=confetti.create(canvas,{resize:true});
      myConfetti({particleCount:120,spread:80,origin:{y:0.6}});
      setTimeout(()=>myConfetti({particleCount:60,spread:120,origin:{y:0.7}}),250);
      setTimeout(()=>{canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height);},2500);
    }
  },100);
};

// ===== ADD-TO-CART POP =====
document.addEventListener('click',e=>{
  const btn=e.target.closest('.add-btn');
  if(!btn) return;
  btn.classList.add('pop');
  setTimeout(()=>btn.classList.remove('pop'),250);
},true);

// ===== REVEAL SECTIONS =====
document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.offers,.filters-wrap,.restaurants,.footer').forEach(el=>el.classList.add('reveal'));
  observeReveals();
});

// reveal sections after load
setTimeout(()=>{ document.querySelectorAll('.reveal').forEach(el=>io.observe(el)); }, 500);

const restaurants = [
  {id:1,name:"Burger King",cuisine:"Burgers, American, Fast Food",rating:4.3,delivery:25,cost:250,img:"https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600",offer:"50% OFF up to ₹100",veg:false,bestseller:true},
  {id:2,name:"Domino's Pizza",cuisine:"Pizzas, Italian, Fast Food",rating:4.1,delivery:30,cost:300,img:"https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600",offer:"Free Delivery",veg:false},
  {id:3,name:"Haldiram's",cuisine:"North Indian, Sweets, Snacks",rating:4.5,delivery:20,cost:200,img:"https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600",offer:"20% OFF",veg:true,bestseller:true},
  {id:4,name:"Biryani Blues",cuisine:"Biryani, Hyderabadi, Kebabs",rating:4.4,delivery:35,cost:350,img:"https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600",offer:"Flat ₹100 OFF",veg:false},
  {id:5,name:"Subway",cuisine:"Healthy, Salads, Sandwiches",rating:4.0,delivery:22,cost:220,img:"https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600",offer:"Buy 1 Get 1",veg:true},
  {id:6,name:"KFC",cuisine:"Chicken, Burgers, Fast Food",rating:3.9,delivery:28,cost:320,img:"https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=600",offer:"30% OFF",veg:false},
  {id:7,name:"Sagar Ratna",cuisine:"South Indian, Dosas",rating:4.6,delivery:18,cost:180,img:"https://images.unsplash.com/photo-1630383249896-424e482df921?w=600",offer:"10% OFF",veg:true,bestseller:true},
  {id:8,name:"Behrouz Biryani",cuisine:"Biryani, Mughlai, Kebabs",rating:4.2,delivery:40,cost:450,img:"https://images.unsplash.com/photo-1642821373181-696a54913e93?w=600",offer:"Free Delivery",veg:false},
  {id:9,name:"Wow! Momo",cuisine:"Momos, Chinese, Tibetan",rating:4.3,delivery:24,cost:210,img:"https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=600",offer:"40% OFF",veg:true},
  {id:10,name:"Pizza Hut",cuisine:"Pizzas, Pastas, Desserts",rating:4.0,delivery:32,cost:280,img:"https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600",offer:"Buy 2 Get 1",veg:false},
  {id:11,name:"McDonald's",cuisine:"Burgers, Beverages, Desserts",rating:4.1,delivery:20,cost:260,img:"https://images.unsplash.com/photo-1550547660-d9450f859349?w=600",offer:"Flat ₹50 OFF",veg:false},
  {id:12,name:"Chai Point",cuisine:"Beverages, Snacks, Breakfast",rating:4.4,delivery:15,cost:120,img:"https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600",offer:"15% OFF",veg:true}
];

const menus = {};
menus[1]=[{cat:"Burgers",items:[{id:101,name:"Whopper",desc:"Flame-grilled beef patty with fresh veggies",price:199,veg:false,img:"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300"},{id:102,name:"Chicken Burger",desc:"Crispy chicken with mayo",price:149,veg:false,img:"https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=300"},{id:103,name:"Veg Burger",desc:"Aloo tikki with fresh lettuce",price:99,veg:true,img:"https://images.unsplash.com/photo-1520072959219-c595dc870360?w=300"}]},{cat:"Sides",items:[{id:104,name:"French Fries",desc:"Crispy golden fries",price:89,veg:true,img:"https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300"},{id:105,name:"Onion Rings",desc:"Crispy onion rings",price:99,veg:true,img:"https://images.unsplash.com/photo-1639024471283-03518883512d?w=300"}]}];
menus[2]=[{cat:"Pizzas",items:[{id:201,name:"Margherita",desc:"Classic cheese & tomato",price:249,veg:true,img:"https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300"},{id:202,name:"Pepperoni",desc:"Loaded with pepperoni",price:349,veg:false,img:"https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300"},{id:203,name:"Farmhouse",desc:"Onion, capsicum, tomato, mushroom",price:399,veg:true,img:"https://images.unsplash.com/photo-1571974599782-87624638275e?w=300"}]},{cat:"Sides",items:[{id:204,name:"Garlic Bread",desc:"Cheesy garlic bread",price:129,veg:true,img:"https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=300"}]}];
menus[3]=[{cat:"Snacks",items:[{id:301,name:"Chole Bhature",desc:"Spicy chole with fluffy bhature",price:120,veg:true,img:"https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=300"},{id:302,name:"Raj Kachori",desc:"Crispy kachori with yogurt",price:90,veg:true,img:"https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300"}]},{cat:"Sweets",items:[{id:303,name:"Gulab Jamun",desc:"Soft milk dumplings in syrup",price:60,veg:true,img:"https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300"},{id:304,name:"Rasgulla",desc:"Spongy cottage cheese balls",price:50,veg:true,img:"https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300"}]}];
menus[4]=[{cat:"Biryani",items:[{id:401,name:"Chicken Biryani",desc:"Aromatic basmati with tender chicken",price:299,veg:false,img:"https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300"},{id:402,name:"Veg Biryani",desc:"Fragrant rice with mixed veggies",price:199,veg:true,img:"https://images.unsplash.com/photo-1596797038530-2c107229654b?w=300"},{id:403,name:"Mutton Biryani",desc:"Slow cooked mutton biryani",price:399,veg:false,img:"https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=300"}]},{cat:"Kebabs",items:[{id:404,name:"Seekh Kebab",desc:"Minced meat skewers",price:180,veg:false,img:"https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=300"}]}];
menus[5]=[{cat:"Subs",items:[{id:501,name:"Veggie Delite",desc:"Fresh veggies with choice of sauce",price:180,veg:true,img:"https://images.unsplash.com/photo-1509722747041-616f39b57569?w=300"},{id:502,name:"Chicken Teriyaki",desc:"Grilled chicken teriyaki",price:260,veg:false,img:"https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=300"}]},{cat:"Salads",items:[{id:503,name:"Caesar Salad",desc:"Crisp romaine with parmesan",price:150,veg:true,img:"https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300"}]}];
menus[6]=[{cat:"Chicken",items:[{id:601,name:"Hot & Crispy",desc:"Signature fried chicken 2pc",price:199,veg:false,img:"https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=300"},{id:602,name:"Zinger Burger",desc:"Crispy chicken burger",price:179,veg:false,img:"https://images.unsplash.com/photo-1606755940144-3a15b5a4b7c2?w=300"}]},{cat:"Buckets",items:[{id:603,name:"Family Bucket",desc:"8pc chicken + sides",price:799,veg:false,img:"https://images.unsplash.com/photo-1562967914-608f82629710?w=300"}]}];

menus[7]=[{cat:"Dosas",items:[{id:701,name:"Masala Dosa",desc:"Crispy dosa with potato filling",price:90,veg:true,img:"https://images.unsplash.com/photo-1630383249896-424e482df921?w=300"},{id:702,name:"Rava Dosa",desc:"Thin crispy rava dosa",price:110,veg:true,img:"https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300"}]},{cat:"Uttapam",items:[{id:703,name:"Onion Uttapam",desc:"Thick pancake with onions",price:80,veg:true,img:"https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300"}]}];
menus[8]=[{cat:"Biryani",items:[{id:801,name:"Royal Chicken Biryani",desc:"Premium long grain biryani",price:349,veg:false,img:"https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300"},{id:802,name:"Veg Dum Biryani",desc:"Slow cooked veg biryani",price:249,veg:true,img:"https://images.unsplash.com/photo-1596797038530-2c107229654b?w=300"}]}];
menus[9]=[{cat:"Momos",items:[{id:901,name:"Veg Steamed Momos",desc:"8pc steamed veg momos",price:99,veg:true,img:"https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=300"},{id:902,name:"Chicken Fried Momos",desc:"8pc crispy chicken momos",price:149,veg:false,img:"https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=300"}]},{cat:"Noodles",items:[{id:903,name:"Hakka Noodles",desc:"Stir fried noodles",price:130,veg:true,img:"https://images.unsplash.com/photo-1585032226651-759b368d7246?w=300"}]}];
menus[10]=[{cat:"Pizzas",items:[{id:1001,name:"Pan Pizza",desc:"Thick crust pan pizza",price:279,veg:false,img:"https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300"},{id:1002,name:"Veggie Supreme",desc:"Loaded veg pizza",price:329,veg:true,img:"https://images.unsplash.com/photo-1571974599782-87624638275e?w=300"}]}];
menus[11]=[{cat:"Burgers",items:[{id:1101,name:"McAloo Tikki",desc:"Potato patty burger",price:79,veg:true,img:"https://images.unsplash.com/photo-1520072959219-c595dc870360?w=300"},{id:1102,name:"McChicken",desc:"Crispy chicken burger",price:129,veg:false,img:"https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=300"}]},{cat:"Fries",items:[{id:1103,name:"Medium Fries",desc:"Salted fries",price:99,veg:true,img:"https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300"}]}];
menus[12]=[{cat:"Beverages",items:[{id:1201,name:"Masala Chai",desc:"Spiced Indian tea",price:40,veg:true,img:"https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300"},{id:1202,name:"Cold Coffee",desc:"Chilled coffee shake",price:120,veg:true,img:"https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300"}]},{cat:"Snacks",items:[{id:1203,name:"Samosa (2pc)",desc:"Crispy samosas",price:30,veg:true,img:"https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300"}]}];

let cart = JSON.parse(localStorage.getItem('foodie_cart')||'[]');
let currentFilter='all',currentSort='relevance',searchQuery='',currentRestaurant=null,selectedPay='upi';
function saveCart(){localStorage.setItem('foodie_cart',JSON.stringify(cart));}
function format(n){return '₹'+n;}
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');clearTimeout(window._tt);window._tt=setTimeout(()=>t.classList.remove('show'),2200);}

function cartCount(){return cart.reduce((a,b)=>a+b.qty,0);}
function cartTotal(){return cart.reduce((a,b)=>a+b.price*b.qty,0);}
function updateCartBadge(){document.getElementById('cartCount').textContent=cartCount();}

function renderRestaurants(){
  const grid=document.getElementById('restGrid');
  let list=restaurants.filter(r=>{
    if(searchQuery){
      const q=searchQuery.toLowerCase();
      if(!r.name.toLowerCase().includes(q) && !r.cuisine.toLowerCase().includes(q)) return false;
    }
    if(currentFilter==='veg' && !r.veg) return false;
    if(currentFilter==='fast' && r.delivery>25) return false;
    if(currentFilter==='top' && r.rating<4.3) return false;
    if(currentFilter==='offers' && !r.offer) return false;
    return true;
  });
  if(currentSort==='rating') list.sort((a,b)=>b.rating-a.rating);
  else if(currentSort==='delivery') list.sort((a,b)=>a.delivery-b.delivery);
  else if(currentSort==='costLow') list.sort((a,b)=>a.cost-b.cost);
  else if(currentSort==='costHigh') list.sort((a,b)=>b.cost-a.cost);
  document.getElementById('resultsCount').textContent=list.length+' restaurants';
  if(!list.length){grid.innerHTML='';document.getElementById('emptyState').style.display='block';return;}
  document.getElementById('emptyState').style.display='none';
  grid.innerHTML=list.map(r=>`
    <div class="rest-card" data-id="${r.id}">
      <div class="rest-img">
        <img src="${r.img}" alt="${r.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x200?text=Food'">
        ${r.bestseller?'<div class="rest-badge">⭐ Bestseller</div>':''}
        <div class="rest-fav" data-fav="${r.id}">♡</div>
      </div>
      <div class="rest-body">
        <div class="rest-name">${r.name}</div>
        <div class="rest-cuisine">${r.cuisine}</div>
        <div class="rest-meta">
          <span class="rest-rating">★ ${r.rating}</span>
          <span class="rest-time">⏱ ${r.delivery} mins</span>
          <span class="rest-cost">💰 ₹${r.cost} for two</span>
        </div>
        ${r.offer?`<div class="rest-offer">🏷️ ${r.offer}</div>`:''}
      </div>
    </div>
  `).join('');
}
renderSkeletons();
setTimeout(()=>renderRestaurants(), 450);


// ===== FILTERS & SEARCH =====
document.querySelectorAll('.filter-chip').forEach(c=>{
  c.addEventListener('click',()=>{
    document.querySelectorAll('.filter-chip').forEach(x=>x.classList.remove('active'));
    c.classList.add('active');
    currentFilter=c.dataset.filter;
    renderRestaurants();
  });
});
document.getElementById('sortSelect').addEventListener('change',e=>{currentSort=e.target.value;renderRestaurants();});
const searchInput=document.getElementById('searchInput');
searchInput.addEventListener('input',e=>{searchQuery=e.target.value.trim();renderRestaurants();});

// ===== RESTAURANT CLICK =====
document.getElementById('restGrid').addEventListener('click',e=>{
  const card=e.target.closest('.rest-card');
  if(!card) return;
  const fav=e.target.closest('.rest-fav');
  if(fav){fav.classList.toggle('liked');fav.textContent=fav.classList.contains('liked')?'♥':'♡';toast(fav.classList.contains('liked')?'Added to favorites':'Removed');return;}
  const r=restaurants.find(x=>x.id==card.dataset.id);
  openMenu(r);
});

function openMenu(r){
  currentRestaurant=r;
  document.getElementById('modalImg').src=r.img;
  document.getElementById('modalName').textContent=r.name;
  document.getElementById('modalMeta').innerHTML=`<span>★ ${r.rating}</span><span>⏱ ${r.delivery} mins</span><span>💰 ₹${r.cost} for two</span><span>${r.cuisine}</span>`;
  const body=document.getElementById('modalBody');
  const cats=menus[r.id]||[];
  body.innerHTML=cats.map(cat=>`
    <div class="menu-category">
      <h3>${cat.cat} (${cat.items.length})</h3>
      ${cat.items.map(it=>`
        <div class="menu-item">
          <div class="menu-item-info">
            <div class="menu-item-name"><span class="${it.veg?'veg-dot':'nonveg-dot'}"></span>${it.name}</div>
            <div class="menu-item-desc">${it.desc}</div>
            <div class="menu-item-price">${format(it.price)}</div>
          </div>
          <div class="menu-item-img">
            <img src="${it.img}" alt="${it.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/120?text=Food'">
            <button class="add-btn" data-add="${it.id}" data-rest="${r.id}">ADD</button>
          </div>
        </div>
      `).join('')}
    </div>
  `).join('');
  document.getElementById('menuOverlay').classList.add('open');
  document.body.style.overflow='hidden';
}

document.getElementById('menuClose').addEventListener('click',closeMenu);
document.getElementById('menuOverlay').addEventListener('click',e=>{if(e.target.id==='menuOverlay')closeMenu();});
function closeMenu(){document.getElementById('menuOverlay').classList.remove('open');document.body.style.overflow='';}

// add to cart from menu
document.getElementById('modalBody').addEventListener('click',e=>{
  const btn=e.target.closest('.add-btn');
  if(!btn) return;
  const itemId=+btn.dataset.add;
  const restId=+btn.dataset.rest;
  const r=restaurants.find(x=>x.id===restId);
  let item=null;
  for(const c of (menus[restId]||[])) for(const it of c.items) if(it.id===itemId){item=it;break;}
  if(!item) return;
  const existing=cart.find(x=>x.id===item.id);
  if(existing) existing.qty++;
  else cart.push({id:item.id,name:item.name,price:item.price,img:item.img,rest:r.name,qty:1});
  saveCart();updateCartBadge();renderCart();
  btn.textContent='ADDED';btn.classList.add('added');
  setTimeout(()=>{btn.textContent='ADD';btn.classList.remove('added');},1200);
  toast(item.name+' added to cart');
});

// ===== CART DRAWER =====
function renderCart(){
  const box=document.getElementById('cartItems');
  if(!cart.length){
    box.innerHTML='<div class="cart-empty"><div class="ce-icon">🛒</div><p>Your cart is empty</p><p style="font-size:12px;margin-top:4px;">Add items to get started</p></div>';
    document.getElementById('cartFooter').style.display='none';
    return;
  }
  box.innerHTML=cart.map(c=>`
    <div class="cart-item">
      <div class="ci-img"><img src="${c.img}" alt="${c.name}" onerror="this.src='https://via.placeholder.com/60?text=Food'"></div>
      <div class="ci-info">
        <div class="ci-name">${c.name}</div>
        <div class="ci-price">${format(c.price)} × ${c.qty}</div>
        <div class="ci-qty">
          <button class="qty-btn" data-dec="${c.id}">−</button>
          <span class="qty-num">${c.qty}</span>
          <button class="qty-btn" data-inc="${c.id}">+</button>
        </div>
        <span class="ci-remove" data-rem="${c.id}">Remove</span>
      </div>
      <div style="font-weight:700;color:var(--secondary);">${format(c.price*c.qty)}</div>
    </div>
  `).join('');
  const sub=cartTotal();
  const tax=Math.round(sub*0.05);
  const del=sub>0?40:0;
  document.getElementById('itemTotal').textContent=format(sub);
  document.getElementById('delFee').textContent=format(del);
  document.getElementById('taxes').textContent=format(tax);
  document.getElementById('grandTotal').textContent=format(sub+del+tax);
  document.getElementById('cartFooter').style.display='block';
}
renderCart();updateCartBadge();

document.getElementById('cartBtn').addEventListener('click',openCart);
document.getElementById('cartClose').addEventListener('click',closeCart);
document.getElementById('cartOverlay').addEventListener('click',closeCart);
function openCart(){document.getElementById('cartDrawer').classList.add('open');document.getElementById('cartOverlay').classList.add('open');document.body.style.overflow='hidden';renderCart();}
function closeCart(){document.getElementById('cartDrawer').classList.remove('open');document.getElementById('cartOverlay').classList.remove('open');document.body.style.overflow='';}

document.getElementById('cartItems').addEventListener('click',e=>{
  const inc=e.target.closest('[data-inc]');
  const dec=e.target.closest('[data-dec]');
  const rem=e.target.closest('[data-rem]');
  if(inc){const c=cart.find(x=>x.id==inc.dataset.inc);if(c){c.qty++;saveCart();renderCart();updateCartBadge();}}
  if(dec){const c=cart.find(x=>x.id==dec.dataset.dec);if(c){c.qty--;if(c.qty<=0)cart=cart.filter(x=>x.id!=c.id);saveCart();renderCart();updateCartBadge();}}
  if(rem){cart=cart.filter(x=>x.id!=rem.dataset.rem);saveCart();renderCart();updateCartBadge();toast('Item removed');}
});

// ===== CHECKOUT =====
document.getElementById('checkoutBtn').addEventListener('click',()=>{
  if(!cart.length) return;
  closeCart();
  document.getElementById('checkoutModal').classList.add('open');
  document.body.style.overflow='hidden';
});
document.querySelectorAll('.pay-opt').forEach(p=>{
  p.addEventListener('click',()=>{
    document.querySelectorAll('.pay-opt').forEach(x=>x.classList.remove('active'));
    p.classList.add('active');
    selectedPay=p.dataset.pay;
  });
});
document.getElementById('placeOrderBtn').addEventListener('click',placeOrder);
function placeOrder(){
  const name=document.getElementById('custName').value.trim();
  const phone=document.getElementById('custPhone').value.trim();
  const addr=document.getElementById('custAddr').value.trim();
  const city=document.getElementById('custCity').value.trim();
  const pin=document.getElementById('custPin').value.trim();
  if(!name||!phone||!addr||!city||!pin){toast('Please fill all fields');return;}
  if(!/^\d{10}$/.test(phone)){toast('Enter valid 10-digit phone');return;}
  const orderId='ORD'+Date.now().toString().slice(-8);
  cart=[];saveCart();renderCart();updateCartBadge();
  document.getElementById('checkoutModal').classList.remove('open');
  document.getElementById('orderId').textContent=orderId;
  document.getElementById('successScreen').classList.add('open');
  // reset form
  ['custName','custPhone','custAddr','custCity','custPin'].forEach(id=>document.getElementById(id).value='');
}
document.getElementById('successClose').addEventListener('click',()=>{
  document.getElementById('successScreen').classList.remove('open');
  document.body.style.overflow='';
});

// ===== LOCATION =====
function setLocation(txt){document.getElementById('locText').textContent=txt;}
if(navigator.geolocation){
  navigator.geolocation.getCurrentPosition(pos=>{
    setLocation('Lat '+pos.coords.latitude.toFixed(2)+', Lng '+pos.coords.longitude.toFixed(2));
  },()=>setLocation('Delhi, India'));
}else setLocation('Delhi, India');
setTimeout(()=>{if(document.getElementById('locText').textContent==='Detecting location...')setLocation('Delhi, India');},2000);

// ===== CLOSE CHECKOUT ON OUTSIDE =====
document.getElementById('checkoutModal').addEventListener('click',e=>{
  if(e.target.id==='checkoutModal'){document.getElementById('checkoutModal').classList.remove('open');document.body.style.overflow='';}
});