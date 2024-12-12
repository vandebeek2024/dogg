import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import validator from 'validator';

const { Schema } = mongoose;

const pendingPurchaseSchema = new Schema({
    orderId: {
        type: String,
        required: true
    },
    orderAmount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true
    },
    transactionHash: {
        type: String,
        required: true
    },
    orderDate: {
        type: Date,
        required: true
    }
});

const confirmedPurchaseSchema = new Schema({
    orderId: {
        type: String,
        required: true
    },
    orderAmount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true
    },
    transactionHash: {
        type: String,
        required: true
    },
    orderDate: {
        type: Date,
        required: true
    }
});

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    surname: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    },
    walletaddress: {
        type: String,
        required: true
    },
    referrerID: {
        type: String,
        required: false
    },
    tokenbalance: {
      type: Number,
      default: 0
    },
    unlockedbalance: {
      type: Number,
      default: 0
    },
    referralearning: {
      type: Number,
      default: 0
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      validate: [
        {
          validator: validator.isEmail,
          message: "Enter a valid email",
        }
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      validate: [
        function (value) {
          return validator.isLength(value, { min: 1 });
        },
        "Minimum 1 character"
      ]
    },
    pendingPurchase: {
        type: [pendingPurchaseSchema],
        default: [] 
    },
    confirmedPurchase: {
        type: [confirmedPurchaseSchema],
        default: []
    }
  },
  {
    timestamps: true
  }
);

userSchema.statics.findByEmail = function(email) {
    return this.findOne({ email });
};
  
userSchema.methods.changePassword = async function(newPassword) {
    this.password = await newPassword;
    await this.save();
};

userSchema.pre('save', async function(next) {
    const user = this;
    if (user.isModified('password')) {
        const hash = await bcrypt.hash(user.password, 10);
        user.password = hash;
    }
    next();
});

const User = mongoose.model("User", userSchema);

export default User;
