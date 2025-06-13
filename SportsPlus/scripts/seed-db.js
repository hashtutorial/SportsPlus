import { db } from '../server/db.js';
import { 
  users, 
  categories, 
  products, 
  productImages 
} from '../shared/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    console.log('Seeding database...');
    
    // Check if categories exist
    const existingCategories = await db.select().from(categories);
    if (existingCategories.length === 0) {
      console.log('Adding categories...');
      await db.insert(categories).values([
        { name: "Soccer", slug: "soccer", imageUrl: "https://images.unsplash.com/photo-1614632537190-23e4146777db?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80" },
        { name: "Cricket", slug: "cricket", imageUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1167&q=80" },
        { name: "Tennis", slug: "tennis", imageUrl: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" },
        { name: "Basketball", slug: "basketball", imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1780&q=80" },
        { name: "Running", slug: "running", imageUrl: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80" }
      ]);
    } else {
      console.log(`Found ${existingCategories.length} existing categories. Skipping category seeding.`);
    }
    
    // Check if products exist
    const existingProducts = await db.select().from(products);
    if (existingProducts.length === 0) {
      console.log('Adding products...');
      
      // Get category IDs
      const categoryData = await db.select().from(categories);
      const categoryMap = new Map();
      categoryData.forEach(category => {
        categoryMap.set(category.slug, category.id);
      });
      
      // Add sample products
      await db.insert(products).values([
        { 
          name: "UEFA Champions League Third Ball", 
          description: "Official match ball for the UEFA Champions League.", 
          price: 99.95, 
          brand: "Adidas", 
          categoryId: categoryMap.get("soccer"), 
          stock: 50, 
          rating: 4.5, 
          numReviews: 120, 
          imageUrl: "https://images.unsplash.com/photo-1614632537190-23e4146777db?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80" 
        },
        { 
          name: "UEFA Champions League Pro 24/25 Knock-Out", 
          description: "Professional match ball for the UEFA Champions League knockout stage.", 
          price: 149.95, 
          brand: "Adidas", 
          categoryId: categoryMap.get("soccer"), 
          stock: 30, 
          rating: 4.8, 
          numReviews: 85, 
          imageUrl: "https://images.unsplash.com/photo-1638965407188-d033cad3c869?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=735&q=80" 
        },
        { 
          name: "Air Zoom Pegasus 38", 
          description: "Responsive running shoes with Zoom Air cushioning.", 
          price: 129.99, 
          brand: "Nike", 
          categoryId: categoryMap.get("running"), 
          stock: 75, 
          rating: 4.6, 
          numReviews: 230, 
          imageUrl: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=764&q=80" 
        },
        { 
          name: "Running Wind Jacket", 
          description: "Lightweight jacket for protection during runs.", 
          price: 89.95, 
          brand: "Adidas", 
          categoryId: categoryMap.get("running"), 
          stock: 45, 
          rating: 4.3, 
          numReviews: 112, 
          imageUrl: "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=765&q=80" 
        },
        { 
          name: "Mercurial Superfly Elite", 
          description: "Professional soccer cleats with dynamic fit collar.", 
          price: 274.99, 
          brand: "Nike", 
          categoryId: categoryMap.get("soccer"), 
          stock: 28, 
          rating: 4.7, 
          numReviews: 95, 
          imageUrl: "https://images.unsplash.com/photo-1524012435847-659cf8c3d158?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80" 
        },
        { 
          name: "Portable Training Net", 
          description: "Portable and easy-to-set-up soccer training net.", 
          price: 49.99, 
          brand: "GoSports", 
          categoryId: categoryMap.get("soccer"), 
          stock: 60, 
          rating: 4.2, 
          numReviews: 78, 
          imageUrl: "https://images.unsplash.com/photo-1631495634750-0cbc534bd069?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" 
        },
        { 
          name: "Ultimate Camouflage Training Tee", 
          description: "High-performance training tee designed for maximum comfort during intense workouts.", 
          price: 24.95, 
          salePrice: 22.45, 
          brand: "TeriFashion", 
          categoryId: categoryMap.get("running"), 
          stock: 100, 
          rating: 4.5, 
          numReviews: 1348, 
          imageUrl: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80" 
        }
      ]);
      
      // Get product IDs for images
      const productData = await db.select().from(products).where(eq(products.name, "Ultimate Camouflage Training Tee"));
      
      if (productData.length > 0) {
        console.log('Adding product images...');
        const trainingTeeId = productData[0].id;
        
        // Add product images
        await db.insert(productImages).values([
          { 
            productId: trainingTeeId, 
            imageUrl: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80", 
            isPrimary: true 
          },
          { 
            productId: trainingTeeId, 
            imageUrl: "https://images.unsplash.com/photo-1627225924765-552d49cf47ad?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80", 
            isPrimary: false 
          },
          { 
            productId: trainingTeeId, 
            imageUrl: "https://images.unsplash.com/photo-1598211686290-a8ef209d87c5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80", 
            isPrimary: false 
          }
        ]);
      }
    } else {
      console.log(`Found ${existingProducts.length} existing products. Skipping product seeding.`);
    }
    
    // Check if we need to add a demo user
    const existingUsers = await db.select().from(users);
    if (existingUsers.length === 0) {
      console.log('Adding demo user...');
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      // Add a demo user
      await db.insert(users).values({
        username: 'demouser',
        email: 'demo@example.com',
        password: hashedPassword,
        fullName: 'Demo User',
        phone: '555-123-4567'
      });
    } else {
      console.log(`Found ${existingUsers.length} existing users. Skipping user seeding.`);
    }
    
    console.log('Seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    process.exit(0);
  }
}

seed();