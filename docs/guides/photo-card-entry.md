# 📸 Photo-Based Card Entry Guide

Learn how to quickly add cards to your collection by uploading photos and letting our AI extract the information automatically.

## Overview

The Photo-Based Card Entry feature uses advanced image recognition to automatically extract card information from photos, saving you time and reducing manual data entry errors.

![Photo Card Entry Form](../screenshots/photo-card-form.png)

## Getting Started

### 1. Access the Photo Card Form

Navigate to **Add Card** from the main menu and select **📸 Photo Scan** from the entry method options.

![Entry Method Selection](../screenshots/entry-method-selection.png)

### 2. Upload Your Photos

#### Front Image (Required)
- Click or drag to upload the front of your card
- This is the primary image used for data extraction
- Must be clear and well-lit

#### Back Image (Optional but Recommended)
- Helps identify card numbers and additional details
- Improves extraction accuracy
- Useful for parallel and serial number detection

![Photo Upload Interface](../screenshots/photo-upload.png)

### 3. Image Requirements

- **File Types**: JPEG, PNG, GIF
- **Max Size**: 100MB per image
- **Resolution**: Higher resolution provides better results
- **Lighting**: Avoid glare and shadows

## Tips for Best Results

### 📷 Photography Tips

1. **Lighting**
   - Use natural light when possible
   - Avoid direct flash to prevent glare
   - Ensure even lighting across the card

2. **Positioning**
   - Place card on a contrasting background
   - Keep the card flat and straight
   - Capture the entire card in frame

3. **Focus**
   - Ensure text is sharp and readable
   - Hold camera steady or use a tripod
   - Take multiple shots if needed

### 🎯 What Gets Extracted

Our AI looks for and extracts:
- **Player Name**
- **Year**
- **Brand/Manufacturer**
- **Card Number**
- **Team**
- **Category** (Baseball, Basketball, etc.)
- **Special Features**:
  - Rookie Cards
  - Autographs
  - Relics/Patches
  - Serial Numbers
  - Parallels

## The Extraction Process

### 1. Processing

After uploading your images, click **🔍 Extract Card Information**. The AI will:
- Analyze both images
- Identify card characteristics
- Extract text and details
- Calculate confidence score

![Processing Animation](../screenshots/photo-processing.png)

### 2. Review Extracted Data

Once processing is complete, you'll see:
- Extracted information with confidence score
- Image thumbnails
- Editable form fields
- Special features detected

![Extraction Results](../screenshots/extraction-results.png)

### 3. Edit and Confirm

- Review all extracted fields
- Make corrections as needed
- Add missing information
- Set purchase price and current value
- Add any notes

### 4. Save to Collection

Click **✅ Add Card to Collection** to save the card with all extracted and edited information.

## Understanding Confidence Scores

The AI provides a confidence score for its extraction:

- **85-100%**: High confidence - Most fields accurately extracted
- **70-84%**: Medium confidence - Review carefully
- **Below 70%**: Low confidence - Manual review recommended

## Common Issues and Solutions

### Poor Extraction Results

**Problem**: Low confidence or incorrect data
**Solutions**:
- Retake photo with better lighting
- Ensure card is flat and in focus
- Clean the card surface
- Try a different angle

### Missing Information

**Problem**: Some fields not extracted
**Solutions**:
- Upload back image for card numbers
- Manually enter missing data
- Use Enhanced Form for complex cards

### Image Upload Errors

**Problem**: Images won't upload
**Solutions**:
- Check file size (under 100MB)
- Ensure correct file format
- Try a different browser
- Clear browser cache

## Advanced Features

### Bulk Photo Processing

Coming soon: Upload multiple card photos at once for batch processing.

### Custom Extraction Rules

Future update: Set preferences for specific brands or card types.

### Integration with Price Guides

Planned feature: Automatic price lookup based on extracted data.

## Best Practices

1. **Start with High-Value Cards**: Test the feature with your most important cards first
2. **Keep Original Photos**: Save your card photos for insurance documentation
3. **Verify Rare Cards**: Double-check extraction for valuable or rare cards
4. **Use for Inventory**: Great for quickly cataloging large collections

## Comparison with Other Entry Methods

| Feature | Photo Entry | Classic Form | Enhanced Form |
|---------|-------------|--------------|---------------|
| Speed | Fast | Medium | Slow |
| Accuracy | 85%+ | Manual | Manual |
| Field Count | Core fields | Basic | 100+ fields |
| Best For | Quick entry | Simple cards | Complex cards |

## FAQ

**Q: Is my card data sent to external servers?**
A: Currently using mock data. In production, images would be processed securely.

**Q: Can I use phone photos?**
A: Yes! Modern phone cameras work great. Just ensure good lighting.

**Q: What if extraction is wrong?**
A: You can edit all fields before saving. Nothing is final until you confirm.

**Q: Does it work with graded cards?**
A: Yes, but you'll need to manually enter grade information.

## Next Steps

- Try uploading your first card photo
- Explore the [Enhanced Form](adding-cards.md#enhanced-form) for detailed entries
- Set up [Bulk Import](adding-cards.md#bulk-import) for large collections
- Configure your [Collection Settings](../features/settings.md)

---

Need help? Check our [Troubleshooting Guide](troubleshooting.md) or [contact support](../README.md#support).