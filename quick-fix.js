require('dotenv').config();
const { supabaseServiceClient } = require('./config/supabase');

async function quickFix() {
  try {
    console.log('🚨 EMERGENCY FIX: Cleaning up all Sa9r data...');

    // Step 1: Delete all Sa9r campaign reports
    console.log('🗑️  Deleting all Sa9r campaign reports...');
    const { data: deletedCampaigns, error: campaignError } = await supabaseServiceClient
      .from('campaign_reports')
      .delete()
      .eq('product_name', 'Sa9r')
      .select();

    if (campaignError) {
      console.error('❌ Error deleting campaigns:', campaignError);
    } else {
      console.log(`✅ Deleted ${deletedCampaigns?.length || 0} Sa9r campaign reports`);
    }

    // Step 2: Delete all CSV upload history for Campaigns.csv
    console.log('🗑️  Deleting upload history for Campaigns.csv...');
    const { data: deletedHistory, error: historyError } = await supabaseServiceClient
      .from('upload_history')
      .delete()
      .eq('file_name', 'Campaigns.csv')
      .select();

    if (historyError) {
      console.error('❌ Error deleting upload history:', historyError);
    } else {
      console.log(`✅ Deleted ${deletedHistory?.length || 0} upload history records`);
    }

    // Step 3: Delete the Sa9r product (will be recreated on next upload)
    console.log('🗑️  Deleting Sa9r product...');
    const { data: deletedProduct, error: productError } = await supabaseServiceClient
      .from('products')
      .delete()
      .eq('product_name', 'Sa9r')
      .select();

    if (productError) {
      console.error('❌ Error deleting product:', productError);
    } else {
      console.log(`✅ Deleted ${deletedProduct?.length || 0} Sa9r product`);
    }

    console.log('\n🎉 CLEAN SLATE! Now you can:');
    console.log('1. ✅ Upload your Campaigns.csv once');
    console.log('2. ✅ Sa9r will show correct ~$81 spend');
    console.log('3. ✅ Click on Sa9r card to edit manual fields');
    console.log('4. ✅ See accurate revenue and profit calculations');

  } catch (error) {
    console.error('❌ Quick fix error:', error);
  }
}

quickFix().then(() => {
  console.log('\n💡 Deploy your backend changes and upload CSV once more!');
  process.exit(0);
}); 