export const PRODUCT_CATEGORIES = {
    'Fashion': [
        'Cultural',
        'Modern',
        'Kids',
        'Shoes'
    ],
    'Electronics': [
        'Mobile Phones',
        'Laptops & Computers',
        'TV & Home Entertainment',
        'Audio & Headphones',
        'Cameras & Accessories',
        'Smart Home & Gadgets'
    ],
    'Jewelry': [
        'Rings',
        'Necklaces',
        'Earrings',
        'Bracelets & Bangles',
        'Watches',
        'Cultural/Traditional Jewelry'
    ],
    'Handmade Crafts': [
        'Home Decor',
        'Baskets & Storage',
        'Textiles & Fabrics',
        'Woodwork & Carvings',
        'Pottery & Ceramics',
        'Art & Paintings'
    ]
} as const;

export type ShopCategory = keyof typeof PRODUCT_CATEGORIES;
