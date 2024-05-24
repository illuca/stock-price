import { Controller, Get, Query } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parser';
import * as dayjs from 'dayjs';

interface StockData {
  timetag: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  amount: number
}

@Controller('stocks')
export class StocksController {
  @Get()
  async getStockData(
    // stock number
    @Query('ticker') ticker: string,
    @Query('startDate') startDate,
    @Query('endDate') endDate,
  ): Promise<StockData[]> {
    startDate=new Date(startDate)
    endDate=new Date(endDate)
    const filePath = path.join(process.cwd(), 'src/data', 'price_000001.csv'); // Adjust path as necessary
    const stockData: StockData[] = [];


    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        // once read one line, push it
        .on('data', (data) => {
          let date = dayjs(data.timetag, 'YYYYMMDD', true).toDate()
          if (startDate <= date && date <= endDate) {
            stockData.push({
              timetag: date.toISOString().split('T')[0],
              open: parseFloat(data.open),
              high: parseFloat(data.high),
              low: parseFloat(data.low),
              close: parseFloat(data.close),
              volume: parseInt(data.volume, 10),
              amount: parseInt(data.amount, 10)
            });
          }
        })
        // after reading all lines
        .on('end', () => {
          resolve(stockData);
        })
        .on('error', (err) => {
          reject(err);
        });
    });
  }
}
