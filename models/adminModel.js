import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import validator from 'validator';

const { Schema } = mongoose;

const adminSchema = new Schema(
  {
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
    }
  },
  {
    timestamps: true
  }
);

adminSchema.statics.findByEmail = function(email) {
    return this.findOne({ email });
};

adminSchema.methods.changePassword = async function(newPassword) {
    this.password = await newPassword;
    await this.save();
};

adminSchema.pre('save', async function(next) {
    const admin = this;
    if (admin.isModified('password')) {
        const hash = await bcrypt.hash(admin.password, 10);
        admin.password = hash;
    }
    next();
});

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
