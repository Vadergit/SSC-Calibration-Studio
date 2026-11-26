export const profiles = [
  {
    "id": "zsc31010",
    "name": "ZSC31010",
    "interfaces": [
      "ZACwire"
    ],
    "bits": "14",
    "output": "Spannung / ZACwire",
    "source": "https://www.renesas.com/en/products/zsc31010",
    "hardware": false,
    "driver": "experimental"
  },
  {
    "id": "zsc31014",
    "name": "ZSC31014",
    "interfaces": [
      "I²C"
    ],
    "bits": "14",
    "output": "Digital",
    "source": "https://www.renesas.com/en/products/zsc31014",
    "hardware": false,
    "driver": "experimental"
  },
  {
    "id": "zsc31015",
    "name": "ZSC31015",
    "interfaces": [
      "ZACwire"
    ],
    "bits": "14",
    "output": "Analog / ZACwire",
    "source": "https://www.renesas.com/en/products/zsc31015",
    "hardware": false,
    "driver": "experimental"
  },
  {
    "id": "zsc31050",
    "name": "ZSC31050",
    "interfaces": [
      "I²C",
      "SPI",
      "ZACwire"
    ],
    "bits": "15",
    "output": "Spannung / Strom / PWM / digital",
    "source": "https://www.renesas.com/en/products/zsc31050",
    "hardware": false,
    "driver": "experimental"
  },
  {
    "id": "zsc31150",
    "name": "ZSC31150",
    "interfaces": [
      "I²C",
      "ZACwire"
    ],
    "bits": "13–16",
    "output": "Spannung / digital",
    "source": "https://www.renesas.com/en/products/zsc31150",
    "hardware": false,
    "driver": "experimental"
  },
  {
    "id": "zssc3154",
    "name": "ZSSC3154",
    "interfaces": [
      "I²C",
      "ZACwire"
    ],
    "bits": "—",
    "output": "Dual Analog / digital",
    "source": "https://www.renesas.com/en/products/zssc3154",
    "hardware": false,
    "driver": "offline"
  },
  {
    "id": "zssc3240",
    "name": "ZSSC3240",
    "interfaces": [
      "I²C",
      "SPI",
      "OWI"
    ],
    "bits": "24",
    "output": "Analog / digital",
    "source": "https://www.renesas.com/en/products/zssc3240",
    "hardware": false,
    "driver": "offline"
  },
  {
    "id": "zssc3281",
    "name": "ZSSC3281",
    "interfaces": [
      "I²C",
      "SPI",
      "OWI"
    ],
    "bits": "24",
    "output": "Dual Channel / analog / digital",
    "source": "https://www.renesas.com/en/products/zssc3281",
    "hardware": false,
    "driver": "offline"
  }
];
export const catalog=[{id:'renesas',name:'Renesas / IDT',models:profiles}];
