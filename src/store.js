import { configureStore } from '@reduxjs/toolkit'
import accountReducer from './features/accounts/accountSlice'
import transactionReducer from './features/transactions/transactionsSlice'
import dashboardReducer from './features/dashboard/dashboardSlice'
import authReducer from './features/auth/authSlice'
import recurringTransactionReducer from './features/recurringTransactions/recurringTransactionsSlice'

export const store = configureStore({
  reducer: {
    account: accountReducer,
    transaction: transactionReducer,
    dashboard: dashboardReducer,
    auth : authReducer,
    recurringTransactions: recurringTransactionReducer,
  },
})