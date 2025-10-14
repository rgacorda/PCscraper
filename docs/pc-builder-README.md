# 🧱 PC Builder Feature

Allows users to assemble a PC using available parts and calculate the total price.

---

## 🧠 Overview

The PC Builder works similarly to **PCPartPicker**:
- Select parts from different categories
- Compute total cost in real time
- Validate compatibility (future feature)
- Save or export builds

---

## ⚙️ Categories
| Category | Example |
|-----------|----------|
| CPU | AMD Ryzen 7 7800X3D |
| GPU | RTX 4070 SUPER |
| Motherboard | B650M DS3H |
| RAM | 32GB DDR5 6000MHz |
| PSU | 750W Gold |
| Storage | NVMe SSD 1TB |
| Case | NZXT H5 Flow |

---

## 🧩 Example Data Structure
```ts
interface PCBuild {
  id: string;
  name: string;
  components: {
    cpu?: PCPart;
    gpu?: PCPart;
    motherboard?: PCPart;
    ram?: PCPart;
    psu?: PCPart;
    storage?: PCPart;
    case?: PCPart;
  };
  totalPrice: number;
}
```

---

## 💡 Calculation Example
```ts
const totalPrice = Object.values(build.components)
  .filter(Boolean)
  .reduce((sum, part) => sum + part.price, 0);
```

---

## 🖥️ Planned Features
- Export builds as shareable links
- Save builds to database per user
- Auto-suggest compatible parts
