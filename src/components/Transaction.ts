export default class Transaction {
  date: Date;

  payee: string;

  category: string;

  memo: string;

  outflow: number;

  inflow: number;

  constructor(
    date: Date,
    payee: string,
    category: string,
    memo: string,
    outflow: number,
    inflow: number,
  ) {
    this.date = date;
    this.payee = payee;
    this.category = category;
    this.memo = memo;
    this.outflow = outflow;
    this.inflow = inflow;
  }
}
