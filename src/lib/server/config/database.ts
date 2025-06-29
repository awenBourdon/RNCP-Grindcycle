export const DATABASE_CONFIG = {
  queryTimeout: 30000, 
  transactionTimeout: 60000,

  maxRetries: 3,
  retryDelay: 1000, 
  
  defaultPageSize: 10,
  maxPageSize: 100,
  
  defaultIncludes: {
    product: {
      usedBoard: {
        select: {
          id: true,
          name: true,
          boardType: true,
          boardCondition: true,
        }
      }
    },
    usedBoard: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  }
} as const