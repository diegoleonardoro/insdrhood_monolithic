import mongoose from "mongoose";
import { Password } from "../services/password";

// An interface that describres the properties that are required to create a new User
interface UserAttrs {
  name: string;
  email: string;
  image: string;
  password: string;
  isVerified: boolean;
  passwordSet: boolean;
  emailToken: string;
  formsResponded: number;
  residentId: string;
  userImagesId: string;
}

// interface that describes the properties that a User model has.
// Add all the properties from mogoose.Model are being passed to UserModel, and we are giving it an extra one: "build"
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// Add an interface that describes the properties that a User document has:
interface UserDoc extends mongoose.Document {
  name: string;
  email: string;
  image: string;
  password: string;
  isVerified: boolean;
  passwordSet: boolean;
  emailToken: string;
  formsResponded: number;
  residentId: string;
  userImagesId: string;
}

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: false,
    },
    isVerified: {
      type: Boolean,
      required: false,
    },
    emailToken: {
      type: String,
      required: false,
    },
    formsResponded: {
      type: Number,
      required: true
    },
    residentId: {
      type: String,
      required: false
    },
    passwordSet: {
      type: Boolean,
      required: true
    },
    userImagesId: {
      type: String,
      required: false
    }

  },
  {
    toJSON: {
      transform(doc, ret) {
        //ret is the option we need to modify if we want to change how the user object is returned:
        ret.id = ret._id;
        delete ret._id;
        // if we do not want the password from any user that is returned
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);


// pre ('save') is a middleware function implemented by mongoose, executed before saving a user to the database. 'done' needs to be called in every async function used with mongoose.
userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const password: string | undefined = this.get("password");
    if (typeof password === "string") {
      const hashed = await Password.toHash(password);
      this.set("password", hashed);
    }
  }
  done();
});



userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

export { User };