
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

// static methods are methods that we can access withouth creating an instance of a class, like Passwrod.toHash.
export class Password {
  static async toHash(password: string) {
    const salt = randomBytes(8).toString("hex");
    // when we call scrypt we get a Buffer (an array with raw data inside of it )
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  }

  static async compare(storedPassword: string, suppliedPassword: string) {
    const [hashedPassword, salt] = storedPassword.split(".");
    const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;
    return buf.toString("hex") === hashedPassword;
  }

}