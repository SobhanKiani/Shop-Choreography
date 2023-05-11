export class Name {
    constructor(private readonly value: string) { }

    public getValue(): string {
        return this.value;
    }

    public getFirstName(): string {
        return this.value.split(" ")[0]
    }

    public getLastName(): string {
        return this.value.split(" ")[1]
    }

}