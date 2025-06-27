const { supabaseServiceClient } = require('./config/supabase');

async function cleanupDuplicates() {
  try {
    console.log('🧹 Starting cleanup of duplicate campaign data...');

    // Get all campaign reports for debugging
    const { data: allCampaigns, error: getAllError } = await supabaseServiceClient
      .from('campaign_reports')
      .select('*');

    if (getAllError) {
      console.error('Error getting campaigns:', getAllError);
      return;
    }

    console.log(`📊 Total campaigns in database: ${allCampaigns.length}`);

    // Group by product name to see duplicates
    const byProduct = allCampaigns.reduce((acc, campaign) => {
      const productName = campaign.product_name || 'Unknown';
      if (!acc[productName]) {
        acc[productName] = [];
      }
      acc[productName].push(campaign);
      return acc;
    }, {});

    console.log('\n📦 Campaigns by product:');
    Object.entries(byProduct).forEach(([productName, campaigns]) => {
      console.log(`  ${productName}: ${campaigns.length} campaigns`);
      const totalSpend = campaigns.reduce((sum, c) => sum + (c.amount_spent || 0), 0);
      console.log(`    Total spend: $${totalSpend.toFixed(2)}`);
    });

    // For Sa9r specifically, let's see what's happening
    const sa9rCampaigns = byProduct['Sa9r'] || [];
    if (sa9rCampaigns.length > 4) {
      console.log(`\n⚠️  Sa9r has ${sa9rCampaigns.length} campaigns (expected 4)`);
      console.log('📄 Files found:');
      const files = [...new Set(sa9rCampaigns.map(c => c.file_name))];
      files.forEach(fileName => {
        const campaignsForFile = sa9rCampaigns.filter(c => c.file_name === fileName);
        console.log(`  ${fileName}: ${campaignsForFile.length} campaigns`);
      });

      // If there are duplicates, remove them (keep only the first 4)
      if (sa9rCampaigns.length > 4) {
        console.log('\n🗑️  Removing duplicate Sa9r campaigns...');
        const duplicates = sa9rCampaigns.slice(4); // Keep first 4, remove rest
        const duplicateIds = duplicates.map(c => c.id);
        
        const { error: deleteError } = await supabaseServiceClient
          .from('campaign_reports')
          .delete()
          .in('id', duplicateIds);

        if (deleteError) {
          console.error('Error deleting duplicates:', deleteError);
        } else {
          console.log(`✅ Deleted ${duplicates.length} duplicate campaigns`);
        }
      }
    }

    console.log('\n✅ Cleanup completed!');

  } catch (error) {
    console.error('❌ Cleanup error:', error);
  }
}

// Run the cleanup
cleanupDuplicates().then(() => {
  console.log('🎉 Done! Check your products page - Sa9r should now show ~$81 spend');
  process.exit(0);
}); 