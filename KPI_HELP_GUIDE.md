# 📊 BiZense KPI Help Guide

## Overview
This guide explains all Key Performance Indicators (KPIs) in your BiZense dashboard and how they're calculated. Understanding these metrics will help you make better business decisions and optimize your product performance.

---

## 💰 **Financial Metrics**

### **Revenue**
**What it measures**: Total money earned from product sales
**Formula**: `Selling Price × Units Delivered`
**Example**: $29.99 × 70 units = $2,099.30
**Why it matters**: This is your gross income before any costs

### **Ad Spend**
**What it measures**: Total money spent on advertising campaigns
**Formula**: Sum of all campaign costs for this product
**Example**: Facebook campaigns total = $81.08
**Why it matters**: Your primary marketing investment

### **Product Cost**
**What it measures**: Cost of goods delivered to customers
**Formula**: `Unit Cost × Units Delivered`
**Example**: $2.29 × 70 units = $160.30
**Why it matters**: Direct cost of fulfilling orders

---

## 📈 **Profitability Metrics**

### **Delivered Profit**
**What it measures**: Profit from units actually delivered
**Formula**: `Revenue - Product Cost - Ad Spend`
**Example**: $2,099.30 - $160.30 - $81.08 = $1,857.92
**Why it matters**: Your actual realized profit

### **Total Profit**
**What it measures**: Profit considering all investments
**Formula**: `Revenue - Total Investment (Stock + Ad Spend + Testing Budget)`
**Example**: $2,099.30 - $424.58 = $1,674.72
**Why it matters**: True profitability after all costs

### **Stock Investment**
**What it measures**: Money tied up in inventory
**Formula**: `Stock Purchased × Unit Cost`
**Example**: 150 units × $2.29 = $343.50
**Why it matters**: Capital allocation and cash flow management

### **Total Investment**
**What it measures**: All money invested in this product
**Formula**: `Stock Investment + Ad Spend + Testing Budget`
**Example**: $343.50 + $81.08 + $0 = $424.58
**Why it matters**: Complete picture of capital deployed

---

## 🎯 **Performance Ratios**

### **ROI (Return on Investment)**
**What it measures**: Profit efficiency on ad spend
**Formula**: `(Delivered Profit ÷ Ad Spend) × 100`
**Example**: ($1,857.92 ÷ $81.08) × 100 = 2,291.47%
**Interpretation**:
- Above 100% = Profitable
- 200%+ = Very good
- 1000%+ = Exceptional
**Why it matters**: Shows advertising effectiveness

### **Total ROI**
**What it measures**: Profit efficiency on all investments
**Formula**: `(Revenue - Total Investment) ÷ Total Investment × 100`
**Example**: ($2,099.30 - $424.58) ÷ $424.58 × 100 = 394.53%
**Why it matters**: Overall business efficiency

### **ROAS (Return on Ad Spend)**
**What it measures**: Revenue generated per dollar spent on ads
**Formula**: `Revenue ÷ Ad Spend`
**Example**: $2,099.30 ÷ $81.08 = 25.89
**Interpretation**:
- 1.0 = Break-even on ads (before product costs)
- 3.0+ = Generally profitable
- 10.0+ = Excellent performance
**Why it matters**: Direct advertising effectiveness

---

## 📊 **Operational Metrics**

### **Units Delivered**
**What it measures**: Products successfully delivered to customers
**Manual Input**: You enter this number based on actual deliveries
**Why it matters**: Conversion from leads to actual sales

### **Stock Purchased**
**What it measures**: Total inventory bought for this product
**Manual Input**: You enter this number
**Why it matters**: Inventory management and future capacity

### **Conversions**
**What it measures**: Actions taken by customers (purchases, leads, etc.)
**Source**: Imported from advertising platforms
**Why it matters**: Campaign effectiveness measurement

### **Clicks**
**What it measures**: Number of ad clicks received
**Source**: Imported from advertising platforms
**Why it matters**: Traffic generation and interest measurement

### **Impressions**
**What it measures**: Number of times ads were shown
**Source**: Imported from advertising platforms
**Why it matters**: Reach and brand awareness

---

## 🏆 **Platform Performance**

### **Best Platform**
**What it measures**: Which advertising platform performs best
**Calculation**: Platform with highest ROAS for this product
**Example**: "Facebook" (if Facebook ads generate best returns)
**Why it matters**: Budget allocation optimization

### **Platform ROAS**
**What it measures**: ROAS broken down by platform
**Formula**: `Revenue ÷ Platform Ad Spend`
**Why it matters**: Compare effectiveness across platforms

---

## 📅 **Daily Breakdown Metrics**

### **Daily Revenue**
**Formula**: `Daily Units Delivered × Selling Price`
**Why track**: Identify high-performing days

### **Daily Profit**
**Formula**: `Daily Revenue - Daily Product Cost - Daily Ad Spend`
**Why track**: Day-by-day profitability analysis

### **Daily ROI**
**Formula**: `(Daily Profit ÷ Daily Ad Spend) × 100`
**Why track**: Optimize timing and budget allocation

---

## 🎯 **How to Use These Metrics**

### **For Profitability Analysis**
1. **Check Delivered Profit**: Is your product making money?
2. **Review ROI**: Are your ads efficient?
3. **Monitor ROAS**: Are you generating enough revenue per ad dollar?

### **For Optimization**
1. **Compare Platform Performance**: Shift budget to best-performing platforms
2. **Analyze Daily Trends**: Identify best times to advertise
3. **Track Unit Economics**: Ensure sustainable profit margins

### **For Scaling Decisions**
1. **Total ROI > 200%**: Good candidate for scaling
2. **ROAS > 10**: Strong advertising performance
3. **Consistent Daily Performance**: Predictable results

### **Warning Signs**
- **ROI < 100%**: Losing money on ads
- **ROAS < 3**: Difficult to be profitable
- **Delivered Profit < 0**: Immediate action needed

---

## 💡 **Pro Tips**

### **Manual Fields Optimization**
- **Update Units Delivered regularly**: Keeps metrics accurate
- **Track Testing Budget**: Get complete ROI picture  
- **Monitor Stock Levels**: Avoid stockouts on winning products

### **Data Interpretation**
- **Focus on Delivered Profit**: Most important bottom-line metric
- **Use Total ROI for scaling decisions**: Considers all investments
- **Track trends over time**: Single-day performance can be misleading

### **Action Items Based on Metrics**
- **High ROI + Low Volume**: Increase ad spend
- **Low ROAS**: Improve ad creative or targeting
- **High Stock Investment**: Optimize inventory management
- **Platform Imbalance**: Test other advertising channels

---

## 🔄 **Data Sources**

### **Automatic (From CSV Uploads)**
- Ad Spend, Conversions, Clicks, Impressions
- Platform information
- Campaign performance data

### **Manual Entry**
- Units Delivered, Stock Purchased
- Unit Cost, Selling Price
- Testing Budget

### **Calculated**
- All profit metrics, ROI, ROAS
- Platform comparisons
- Daily breakdowns

---

## ❓ **Frequently Asked Questions**

**Q: Why is my Revenue 0 even with ad spend?**
A: You need to enter "Units Delivered" and "Selling Price" in the product settings.

**Q: What's the difference between ROI and ROAS?**
A: ROI measures profit efficiency, ROAS measures revenue efficiency. ROI is better for profitability decisions.

**Q: Should I focus on ROI or Total ROI?**
A: Use ROI for advertising decisions, Total ROI for overall business performance.

**Q: Why does Platform show "Mixed"?**
A: This happens when campaigns span multiple platforms. Check individual campaign data for details.

**Q: How often should I update manual fields?**
A: Update Units Delivered weekly, other fields when they change (new inventory, price updates).

---

## 🎯 **Quick Reference Card**

| Metric | Good | Great | Exceptional |
|--------|------|-------|-------------|
| ROI | >100% | >300% | >1000% |
| ROAS | >3.0 | >8.0 | >20.0 |
| Total ROI | >50% | >200% | >500% |
| Delivered Profit | >$0 | >$500 | >$2000 |

**Remember**: These are general guidelines. Your industry and business model may have different benchmarks.

---

*Need help? Contact support or check our video tutorials for step-by-step guidance.* 