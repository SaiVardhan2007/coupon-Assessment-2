const mongoose = require('mongoose');
require('dotenv').config();

async function migrateCouponData() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Get the coupons collection
    const db = mongoose.connection.db;
    const couponsCollection = db.collection('coupons');

    // Find all coupons with old usedBy structure
    const coupons = await couponsCollection.find({}).toArray();
    console.log(`📊 Found ${coupons.length} coupons to check`);

    let migratedCount = 0;

    for (let coupon of coupons) {
      let needsUpdate = false;
      let newUsedBy = [];

      if (coupon.usedBy && Array.isArray(coupon.usedBy)) {
        for (let usage of coupon.usedBy) {
          // Check if it's an old format (just ObjectId) or new format (object with user and usedAt)
          if (typeof usage === 'string' || (usage && !usage.user && !usage.usedAt)) {
            // Old format - convert to new format
            newUsedBy.push({
              user: usage,
              usedAt: coupon.updatedAt || new Date()
            });
            needsUpdate = true;
          } else if (usage && usage.user) {
            // Already in new format
            newUsedBy.push(usage);
          }
        }
      }

      if (needsUpdate) {
        await couponsCollection.updateOne(
          { _id: coupon._id },
          { $set: { usedBy: newUsedBy } }
        );
        migratedCount++;
        console.log(`✅ Migrated coupon: ${coupon.couponName}`);
      }
    }

    console.log(`🎉 Migration completed! Updated ${migratedCount} coupons`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📴 Disconnected from MongoDB');
  }
}

migrateCouponData();
