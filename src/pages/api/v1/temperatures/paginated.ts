/* eslint-disable @typescript-eslint/no-explicit-any */
import Temperature from 'core/models/Temperature';
import { dbConnect } from 'core/utils/mongosee';
import { NextApiRequest, NextApiResponse } from 'next';

dbConnect();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const {
          page = '1',
          limit = '10',
          sortBy = 'createdAt',
          sortOrder = 'desc',
          startDate,
          endDate,
        } = req.query;

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const skip = (pageNum - 1) * limitNum;

        // Build filter object
        const filter: any = {};

        if (startDate || endDate) {
          filter.createdAt = {};
          if (startDate) filter.createdAt.$gte = new Date(startDate as string);
          if (endDate) filter.createdAt.$lte = new Date(endDate as string);
        }

        // Build sort object
        const sort: any = {};
        sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

        // Execute queries
        const [data, total] = await Promise.all([
          Temperature.find(filter).sort(sort).skip(skip).limit(limitNum).lean(),
          Temperature.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(total / limitNum);
        const hasNextPage = pageNum < totalPages;
        const hasPrevPage = pageNum > 1;

        return res.status(200).json({
          data,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalItems: total,
            itemsPerPage: limitNum,
            hasNextPage,
            hasPrevPage,
          },
        });
      } catch (error: any) {
        return res.status(400).json({ error: error.message });
      }
    default:
      return res.status(405).json({ msg: 'Method not allowed' });
  }
}

export default handler;
