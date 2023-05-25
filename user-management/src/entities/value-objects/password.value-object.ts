import * as bcrypt from 'bcryptjs';

export class Password {
  constructor(private readonly value: string) { }

  // Add any necessary methods or validations here

  public getValue(): string {
    return this.value;
  }

  public async getHashedValue(): Promise<string> {
    const hashedPassword = await bcrypt.hash(this.value, 8);
    return hashedPassword
  }
}