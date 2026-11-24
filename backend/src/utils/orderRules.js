exports.SHIPPING_FEE = 59; // flat shipping per order
exports.MAX_QTY = 10;
exports.MAX_LINES = 20;

const str = (v) => (typeof v === "string" ? v.trim() : "");

exports.validateAddress = (a = {}) => {
  let phone = str(a.phone).replace(/\D/g, "");
  if (phone.length === 12 && phone.startsWith("91")) phone = phone.slice(2);

  const value = {
    name: str(a.name),
    phone,
    line1: str(a.line1),
    line2: str(a.line2),
    city: str(a.city),
    state: str(a.state),
    pincode: str(a.pincode),
  };

  if (value.name.length < 2 || value.name.length > 80) return { error: "Enter your full name" };
  if (!/^[6-9]\d{9}$/.test(value.phone)) return { error: "Enter a valid 10-digit mobile number" };
  if (value.line1.length < 5 || value.line1.length > 150)
    return { error: "Enter your house / street address" };
  if (value.line2.length > 150) return { error: "Address line 2 is too long" };
  if (value.city.length < 2 || value.city.length > 60) return { error: "Enter your city" };
  if (value.state.length < 2 || value.state.length > 60) return { error: "Enter your state" };
  if (!/^[1-9]\d{5}$/.test(value.pincode)) return { error: "Enter a valid 6-digit pincode" };

  return { value };
};