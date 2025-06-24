import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

// Escape CSV fields safely
const escapeCsvField = (field: string | number | null | undefined): string => {
  if (field === null || field === undefined) return '""';
  const stringField = String(field).replace(/\r?\n|\r/g, ' '); // remove line breaks
  if (stringField.includes(',') || stringField.includes('"')) {
    return `"${stringField.replace(/"/g, '""')}"`; // escape quotes
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

    let csvContent = headers.join(',') + '\n';

    for (const product of products) {
      if (product.hasColorVariations && product.colorVariations.length > 0) {
        const itemGroupId = product._id.toString();
        product.colorVariations.forEach((variation: { color: string; stock: number }) => {
          const variationId = `${itemGroupId}-${variation.color.replace(/\s+/g, '-').toLowerCase()}`;
          const row = [
            escapeCsvField(variationId),
            escapeCsvField(product.name),
            escapeCsvField(product.description),
            escapeCsvField(variation.stock > 0 ? 'in stock' : 'out of stock'),
            escapeCsvField('new'),
            escapeCsvField(`${product.price} TND`),
            escapeCsvField(`${origin}/products/${product._id}`),
            escapeCsvField(product.image),
            escapeCsvField('smartifystore'),
            escapeCsvField(itemGroupId),
            escapeCsvField(variation.color),
          ];
          csvContent += row.join(',') + '\n';
        });
      } else {
        const row = [
          escapeCsvField(product._id.toString()),
          escapeCsvField(product.name),
          escapeCsvField(product.description),
          escapeCsvField(product.stock > 0 ? 'in stock' : 'out of stock'),
          escapeCsvField('new'),
          escapeCsvField(`${product.price} TND`),
          escapeCsvField(`${origin}/products/${product._id}`),
          escapeCsvField(product.image),
          escapeCsvField('smartifystore'),
          '',
          '',
        ];
        csvContent += row.join(',') + '\n';
      }
    }

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
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
