export class Description {
    constructor(private readonly value: string) { }

    // Add any necessary methods or validations here

    public getValue(): string {
        return this.value;
    }
}