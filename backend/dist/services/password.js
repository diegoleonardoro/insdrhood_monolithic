"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Password = void 0;
const crypto_1 = require("crypto");
const util_1 = require("util");
const scryptAsync = (0, util_1.promisify)(crypto_1.scrypt);
// static methods are methods that we can access withouth creating an instance of a class, like Passwrod.toHash.
class Password {
    static async toHash(password) {
        const salt = (0, crypto_1.randomBytes)(8).toString("hex");
        // when we call scrypt we get a Buffer (an array with raw data inside of it )
        const buf = (await scryptAsync(password, salt, 64));
        return `${buf.toString("hex")}.${salt}`;
    }
    static async compare(storedPassword, suppliedPassword) {
        const [hashedPassword, salt] = storedPassword.split(".");
        const buf = (await scryptAsync(suppliedPassword, salt, 64));
        return buf.toString("hex") === hashedPassword;
    }
}
exports.Password = Password;
