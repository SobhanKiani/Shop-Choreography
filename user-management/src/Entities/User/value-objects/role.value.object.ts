export class Role {
    constructor(private readonly value: string) { }

    public getValue(): string {
        return this.value;
    }
}
