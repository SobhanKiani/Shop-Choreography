export class Version {
    constructor(private readonly value: number) { }

    // Add any necessary methods or validations here

    public getValue(): number {
        return this.value;
    }
}