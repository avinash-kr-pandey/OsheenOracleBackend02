import User from "../models/user.js";
import Joi from "joi";

// Normalize legacy address payloads (street/city/state/postalCode/country)
// Converts legacy fields into { type, name, address, phone, isDefault }
function normalizeAddressPayload(body) {
  if (!body) return body;
  const hasLegacy = body.street || body.city || body.state || body.postalCode || body.country;
  if (!hasLegacy) return body;

  const parts = [body.street, body.city, body.state, body.postalCode, body.country].filter(Boolean);
  const address = parts.join(", ");

  return {
    ...body,
    address: body.address || address,
    type: body.type || "Other",
    name: body.name || body.recipient || "Unknown",
    phone: body.phone || "",
    isDefault: typeof body.isDefault === 'boolean' ? body.isDefault : false,
  };
}

// ------------ ADD ADDRESS ------------
export const addAddress = async (req, res) => {
  try {
    // Accept legacy address payloads and normalize fields
    req.body = normalizeAddressPayload(req.body);

    const schema = Joi.object({
      type: Joi.string().required(),
      name: Joi.string().required(),
      address: Joi.string().required(),
      phone: Joi.string().required(),
      isDefault: Joi.boolean().optional()
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // If default selected → remove default from existing addresses
    if (req.body.isDefault) {
      user.addresses.forEach(a => (a.isDefault = false));
    }

    user.addresses.push(req.body);
    await user.save();

    res.status(201).json({ message: "Address added successfully", addresses: user.addresses });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------ GET ALL ADDRESSES ------------
export const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ addresses: user.addresses });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------ UPDATE ADDRESS ------------
export const updateAddress = async (req, res) => {
  try {
    // Accept legacy address payloads and normalize fields
    req.body = normalizeAddressPayload(req.body);

    const schema = Joi.object({
      type: Joi.string().optional(),
      name: Joi.string().optional(),
      address: Joi.string().optional(),
      phone: Joi.string().optional(),
      isDefault: Joi.boolean().optional()
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const { addressId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const address = user.addresses.id(addressId);
    if (!address) return res.status(404).json({ message: "Address not found" });

    // Update default state
    if (req.body.isDefault) {
      user.addresses.forEach(a => (a.isDefault = false));
    }

    Object.assign(address, req.body);

    await user.save();

    res.json({ message: "Address updated", addresses: user.addresses });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------ DELETE ADDRESS ------------
export const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.addresses = user.addresses.filter(
      a => a._id.toString() !== addressId
    );

    await user.save();

    res.json({ message: "Address deleted", addresses: user.addresses });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
