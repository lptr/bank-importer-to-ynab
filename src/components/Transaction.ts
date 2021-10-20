export default class Transaction {
  date: Date;

  payee: string;

  category: string;

  memo: string;

  amount: number;

  constructor(
    date: Date,
    payee: string,
    category: string,
    memo: string,
    amount: number,
  ) {
    this.date = date;
    this.payee = payee;
    this.category = category;
    this.memo = memo;
    this.amount = amount;
  }

  toYnab(): string[] {
    return [
      Transaction.toYnabDate(this.date),
      this.payee,
      this.category,
      this.memo,
      this.amount < 0 ? (-this.amount).toFixed(2) : '',
      this.amount >= 0 ? this.amount.toFixed(2) : '',
    ];
  }

  static toYnabDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
