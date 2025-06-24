import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

// Helper function to escape CSV fields
const escapeCsvField = (field: string | number | null | undefined): string => {
  if (field === null || field === undefined) {
    return '""';
  }
  const stringField = String(field);
  if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\\n')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  return stringField;
};

export async function GET(request: Request) {
  try {
    await connectDB();
    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });

    const { origin } = new URL(request.url);

    const headers = [
      'id',
      'title',
      'description',
      'availability',
      'condition',
      'price',
      'link',
      'image_link',
      'brand',
      'item_group_id',
      'color',
    ];

    let csvContent = headers.join(',') + '\\n';

    for (const product of products) {
      if (product.hasColorVariations && product.colorVariations.length > 0) {
        const itemGroupId = product._id.toString();
        
        product.colorVariations.forEach((variation: { color: string; stock: number }) => {
          const variationId = `${itemGroupId}-${variation.color.replace(/\\s+/g, '-').toLowerCase()}`;
          const row = [
            escapeCsvField(variationId), // id
            escapeCsvField(product.name), // title
            escapeCsvField(product.description), // description
            escapeCsvField(variation.stock > 0 ? 'in stock' : 'out of stock'), // availability
            escapeCsvField('new'), // condition
            escapeCsvField(`${product.price} TND`), // price
            escapeCsvField(`${origin}/products/${product._id}`), // link
            escapeCsvField(product.image), // image_link
            escapeCsvField('smartifystore'), // brand
            escapeCsvField(itemGroupId), // item_group_id
            escapeCsvField(variation.color), // color
          ];
          csvContent += row.join(',') + '\\n';
        });
      } else {
        const row = [
          escapeCsvField(product._id.toString()), // id
          escapeCsvField(product.name), // title
          escapeCsvField(product.description), // description
          escapeCsvField(product.stock > 0 ? 'in stock' : 'out of stock'), // availability
          escapeCsvField('new'), // condition
          escapeCsvField(`${product.price} TND`), // price
          escapeCsvField(`${origin}/products/${product._id}`), // link
          escapeCsvField(product.image), // image_link
          escapeCsvField('smartifystore'), // brand
          '', // item_group_id
          '', // color
        ];
        csvContent += row.join(',') + '\\n';
      }
    }

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="facebook_product_catalog.csv"',
      },
    });

  } catch (error) {
    console.error('Error generating Facebook product catalog:', error);
    return NextResponse.json(
      { error: 'Error generating Facebook product catalog' },
      { status: 500 }
    );
  }
} 