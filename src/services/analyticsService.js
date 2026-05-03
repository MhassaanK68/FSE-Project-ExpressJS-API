const { Transaction, TransactionItem, Product, ComboItem } = require('../models');
const { Sequelize } = require('sequelize');
const { Op } = Sequelize;

/**
 * Analytics Service
 * Business logic layer for analytics operations
 */
class AnalyticsService {
  /**
   * Format date to ISO string with Pakistan timezone (+05:00)
   * This matches the format of created_at as stored in the database
   * Since dates are already in Pakistan time, we format using local values
   */
  formatDateAsStored(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
    
    // Format with Pakistan timezone offset (+05:00)
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}+05:00`;
  }

  /**
   * Adjust created_at by subtracting 5 hours and format it as ISO string with Z (UTC)
   * This is used for the created_at field in transaction responses
   * Example: 2026-01-10T23:33:23.000Z becomes 2026-01-10T18:33:23.000Z
   */
  formatCreatedAt(dateValue) {
    if (!dateValue) return null;
    
    // Convert to Date if it's a string
    const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
    
    // Subtract 5 hours (5 * 60 * 60 * 1000 milliseconds)
    const adjustedDate = new Date(date.getTime() - (5 * 60 * 60 * 1000));
    
    // Format as ISO string with Z (UTC format)
    return adjustedDate.toISOString();
  }

  /**
   * Get current date/time in Pakistan timezone (UTC+5)
   * Returns an object with Pakistan time components
   */
  getPakistanTime() {
    const now = new Date();
    // Pakistan is UTC+5, so add 5 hours to UTC time
    const pakistanTime = new Date(now.getTime() + (5 * 60 * 60 * 1000));
    
    return {
      year: pakistanTime.getUTCFullYear(),
      month: pakistanTime.getUTCMonth(),
      date: pakistanTime.getUTCDate(),
      hours: pakistanTime.getUTCHours(),
      minutes: pakistanTime.getUTCMinutes(),
      seconds: pakistanTime.getUTCSeconds(),
      milliseconds: pakistanTime.getUTCMilliseconds(),
    };
  }

  /**
   * Create a Date object for start/end of a day in Pakistan timezone
   * @param {number} year - Year in Pakistan time
   * @param {number} month - Month (0-11) in Pakistan time
   * @param {number} day - Day in Pakistan time
   * @param {number} hour - Hour (0-23) in Pakistan time
   * @param {number} minute - Minute (0-59) in Pakistan time
   * @param {number} second - Second (0-59) in Pakistan time
   * @param {number} millisecond - Millisecond (0-999) in Pakistan time
   * @returns {Date} Date object representing the Pakistan time as UTC
   */
  createPakistanDate(year, month, day, hour = 0, minute = 0, second = 0, millisecond = 0) {
    // Create UTC date for the Pakistan time, then subtract 5 hours to get actual UTC
    const pakistanTime = Date.UTC(year, month, day, hour, minute, second, millisecond);
    return new Date(pakistanTime - (5 * 60 * 60 * 1000));
  }

  /**
   * Format Pakistan calendar date as string for DB query (created_at is stored in Pakistan local time).
   * @param {number} year - Year
   * @param {number} month - Month (0-11)
   * @param {number} day - Day of month
   * @param {boolean} endOfDay - If true, return 23:59:59.999 for inclusive end
   * @returns {string} 'YYYY-MM-DD HH:mm:ss' or 'YYYY-MM-DD 23:59:59.999'
   */
  formatPakistanDateString(year, month, day, endOfDay = false) {
    const y = year;
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    if (endOfDay) {
      return `${y}-${m}-${d} 23:59:59.999`;
    }
    return `${y}-${m}-${d} 00:00:00`;
  }

  /**
   * Get date range for a period
   * Returns both Date objects (for summary display) and Pakistan-time strings (for DB query; created_at is stored in Pakistan local time).
   */
  getDateRangeForPeriod(period) {
    const pakistanNow = this.getPakistanTime();
    let startDate, endDate, startDateStr, endDateStr;

    if (period === 'today') {
      // Start of today in Pakistan time
      startDate = this.createPakistanDate(pakistanNow.year, pakistanNow.month, pakistanNow.date, 0, 0, 0, 0);
      endDate = this.createPakistanDate(pakistanNow.year, pakistanNow.month, pakistanNow.date, 23, 59, 59, 999);
      startDateStr = this.formatPakistanDateString(pakistanNow.year, pakistanNow.month, pakistanNow.date, false);
      endDateStr = this.formatPakistanDateString(pakistanNow.year, pakistanNow.month, pakistanNow.date, true);
    } else if (period === '7days') {
      // 7 days ago from start of today in Pakistan time
      const startPakDate = new Date(Date.UTC(pakistanNow.year, pakistanNow.month, pakistanNow.date));
      startPakDate.setUTCDate(startPakDate.getUTCDate() - 7);
      const startY = startPakDate.getUTCFullYear();
      const startM = startPakDate.getUTCMonth();
      const startD = startPakDate.getUTCDate();
      startDate = this.createPakistanDate(startY, startM, startD, 0, 0, 0, 0);
      endDate = this.createPakistanDate(pakistanNow.year, pakistanNow.month, pakistanNow.date, 23, 59, 59, 999);
      startDateStr = this.formatPakistanDateString(startY, startM, startD, false);
      endDateStr = this.formatPakistanDateString(pakistanNow.year, pakistanNow.month, pakistanNow.date, true);
    } else if (period === '30days') {
      // 30 days ago from start of today in Pakistan time
      const startPakDate = new Date(Date.UTC(pakistanNow.year, pakistanNow.month, pakistanNow.date));
      startPakDate.setUTCDate(startPakDate.getUTCDate() - 30);
      const startY = startPakDate.getUTCFullYear();
      const startM = startPakDate.getUTCMonth();
      const startD = startPakDate.getUTCDate();
      startDate = this.createPakistanDate(startY, startM, startD, 0, 0, 0, 0);
      endDate = this.createPakistanDate(pakistanNow.year, pakistanNow.month, pakistanNow.date, 23, 59, 59, 999);
      startDateStr = this.formatPakistanDateString(startY, startM, startD, false);
      endDateStr = this.formatPakistanDateString(pakistanNow.year, pakistanNow.month, pakistanNow.date, true);
    } else {
      // Specific date format: YYYY-MM-DD (interpreted as Pakistan time)
      const dateMatch = period.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (!dateMatch) {
        throw new Error('Invalid period format');
      }
      const [, year, month, day] = dateMatch;
      const y = parseInt(year);
      const m = parseInt(month) - 1;
      const d = parseInt(day);
      startDate = this.createPakistanDate(y, m, d, 0, 0, 0, 0);
      endDate = this.createPakistanDate(y, m, d, 23, 59, 59, 999);
      startDateStr = this.formatPakistanDateString(y, m, d, false);
      endDateStr = this.formatPakistanDateString(y, m, d, true);
    }

    return { startDate, endDate, startDateStr, endDateStr };
  }

  /**
   * Get date range from from_date and to_date strings (interpreted as Pakistan time)
   * Returns both Date objects (for summary display) and Pakistan-time strings (for DB query).
   */
  getDateRangeFromStrings(fromDateStr, toDateStr) {
    // Parse from_date
    const fromMatch = fromDateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!fromMatch) {
      throw new Error('Invalid from_date format');
    }
    const [, fromYear, fromMonth, fromDay] = fromMatch;
    const startDate = this.createPakistanDate(parseInt(fromYear), parseInt(fromMonth) - 1, parseInt(fromDay), 0, 0, 0, 0);
    const startDateStr = `${fromDateStr} 00:00:00`;

    // Parse to_date
    const toMatch = toDateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!toMatch) {
      throw new Error('Invalid to_date format');
    }
    const [, toYear, toMonth, toDay] = toMatch;
    const endDate = this.createPakistanDate(parseInt(toYear), parseInt(toMonth) - 1, parseInt(toDay), 23, 59, 59, 999);
    const endDateStr = `${toDateStr} 23:59:59.999`;

    if (startDate > endDate) {
      throw new Error('from_date cannot be after to_date');
    }

    return { startDate, endDate, startDateStr, endDateStr };
  }

  /**
   * Get transactions by period
   */
  async getTransactionsByPeriod(period = 'today') {
    const { startDate, endDate, startDateStr, endDateStr } = this.getDateRangeForPeriod(period);

    const transactions = await Transaction.findAll({
      where: {
        created_at: {
          [Op.between]: [startDateStr, endDateStr],
        },
        status: 'completed',
      },
      include: [
        {
          model: TransactionItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price', 'category', 'product_type'],
              required: false, // Left join in case product was deleted
              include: [
                {
                  model: ComboItem,
                  as: 'comboItems',
                  attributes: ['id', 'combo_id', 'product_id', 'quantity'],
                  required: false,
                  include: [
                    {
                      model: Product,
                      as: 'product',
                      attributes: ['id', 'name', 'price', 'category'],
                      required: false,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    // Calculate summary
    const totalOrders = transactions.length;
    const totalAmount = transactions.reduce((sum, tx) => {
      return sum + parseFloat(tx.total_amount || 0);
    }, 0);

    // Format transactions for response
    const formattedTransactions = transactions.map((tx) => {
      const txData = tx.toJSON();
      return {
        id: txData.id,
        transaction_number: txData.transaction_number,
        status: txData.status,
        total_amount: txData.total_amount.toString(),
        payment_method: txData.payment_method,
        created_at: this.formatCreatedAt(txData.created_at),
        items: (txData.items || []).map((item) => {
          const itemData = {
            id: item.id,
            quantity: item.quantity,
            product_name: item.product_name,
            unit_price: item.unit_price.toString(),
            subtotal: item.subtotal.toString(),
            product: null,
          };

          if (item.product) {
            itemData.product = {
              id: item.product.id,
              name: item.product.name,
              price: item.product.price.toString(),
              category: item.product.category,
              product_type: item.product.product_type,
            };

            // If it's a combo product, include combo items breakdown
            if (item.product.product_type === 'combo' && item.product.comboItems) {
              itemData.product.combo_items = item.product.comboItems.map((comboItem) => ({
                id: comboItem.id,
                product_id: comboItem.product_id,
                quantity: comboItem.quantity,
                product: comboItem.product ? {
                  id: comboItem.product.id,
                  name: comboItem.product.name,
                  price: comboItem.product.price.toString(),
                  category: comboItem.product.category,
                } : null,
              }));
            }
          }

          return itemData;
        }),
      };
    });

    return {
      transactions: formattedTransactions,
      summary: {
        total_orders: totalOrders,
        total_amount: totalAmount,
        period: period,
        date_range: {
          start: this.formatDateAsStored(startDate),
          end: this.formatDateAsStored(endDate),
        },
      },
    };
  }

  /**
   * Get transactions by date range
   */
  async getTransactionsByDateRange(fromDate, toDate) {
    const { startDate, endDate, startDateStr, endDateStr } = this.getDateRangeFromStrings(fromDate, toDate);

    const transactions = await Transaction.findAll({
      where: {
        created_at: {
          [Op.between]: [startDateStr, endDateStr],
        },
        status: 'completed',
      },
      include: [
        {
          model: TransactionItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price', 'category'],
              required: false,
            },
          ],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    // Calculate summary
    const totalOrders = transactions.length;
    const totalAmount = transactions.reduce((sum, tx) => {
      return sum + parseFloat(tx.total_amount || 0);
    }, 0);

    // Format transactions for response
    const formattedTransactions = transactions.map((tx) => {
      const txData = tx.toJSON();
      return {
        id: txData.id,
        transaction_number: txData.transaction_number,
        status: txData.status,
        total_amount: txData.total_amount.toString(),
        payment_method: txData.payment_method,
        created_at: this.formatCreatedAt(txData.created_at),
        items: (txData.items || []).map((item) => {
          const itemData = {
            id: item.id,
            quantity: item.quantity,
            product_name: item.product_name,
            unit_price: item.unit_price.toString(),
            subtotal: item.subtotal.toString(),
            product: null,
          };

          if (item.product) {
            itemData.product = {
              id: item.product.id,
              name: item.product.name,
              price: item.product.price.toString(),
              category: item.product.category,
              product_type: item.product.product_type,
            };

            // If it's a combo product, include combo items breakdown
            if (item.product.product_type === 'combo' && item.product.comboItems) {
              itemData.product.combo_items = item.product.comboItems.map((comboItem) => ({
                id: comboItem.id,
                product_id: comboItem.product_id,
                quantity: comboItem.quantity,
                product: comboItem.product ? {
                  id: comboItem.product.id,
                  name: comboItem.product.name,
                  price: comboItem.product.price.toString(),
                  category: comboItem.product.category,
                } : null,
              }));
            }
          }

          return itemData;
        }),
      };
    });

    return {
      transactions: formattedTransactions,
      summary: {
        total_orders: totalOrders,
        total_amount: totalAmount,
        from_date: fromDate,
        to_date: toDate,
        date_range: {
          start: this.formatDateAsStored(startDate),
          end: this.formatDateAsStored(endDate),
        },
      },
    };
  }

  /**
   * Get general statistics (today's orders, today's sales, total orders)
   * Since there's no user model, this returns overall statistics
   */
  async getStatistics() {
    const { startDateStr, endDateStr } = this.getDateRangeForPeriod('today');

    // Get today's transactions (use Pakistan date strings; created_at is stored in Pakistan local time)
    const todayTransactions = await Transaction.findAll({
      where: {
        created_at: {
          [Op.between]: [startDateStr, endDateStr],
        },
        status: 'completed',
      },
      attributes: ['id', 'total_amount'],
    });

    const todayOrders = todayTransactions.length;
    const todaySales = todayTransactions.reduce((sum, tx) => {
      return sum + parseFloat(tx.total_amount || 0);
    }, 0);

    // Get total orders
    const totalOrdersResult = await Transaction.count({
      where: {
        status: 'completed',
      },
    });

    return {
      stats: {
        today_orders: todayOrders,
        today_sales: todaySales,
        total_orders: totalOrdersResult,
      },
    };
  }
}

module.exports = new AnalyticsService();

