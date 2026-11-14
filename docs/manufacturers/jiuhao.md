# Jiuhao Microelectronics (JHM) — SSC support

[← Manufacturer overview](../../README.md)

**Status:** Planned — no SSC driver has been marked complete in the universal application.

## Supported device families

Manufacturer: **Beijing Jiuhao Micro-electronics Co., Ltd.**, China. [Manufacturer product catalogue (2022)](https://cha.caca-chips.com/public/uploads/20220831/d4549a4ffb93ae174d56ad438515202e.pdf) · [Jiuhao company / product listing](https://c.gongkong.com/PhoneVersion/index?cid=53700).

The JHM family includes programmable SSCs for **resistive-bridge pressure sensors** and **ceramic capacitive pressure sensors**. Grouping below is based on documented device families and interfaces; exact shared programming commands and evaluation-board compatibility still require validation.

- [ ] **Jiuhao platform complete**
  - [ ] **G1 — JHM110X, one-wire resistive-bridge / automotive pressure SSCs**
    - [ ] **JHM1101** — MSOP10; 14-bit ADC, one-wire calibration interface, analog or digital output. [Product details](https://c.gongkong.com/PhoneVersion/ProductDetail?pId=86991) · [Catalogue](https://cha.caca-chips.com/public/uploads/20220831/d4549a4ffb93ae174d56ad438515202e.pdf)
    - [ ] **JHM1102** — SOP8; same JHM110X family. [Family reference](https://www.psznh.com/news/201607/01/149.html) · [Catalogue](https://cha.caca-chips.com/public/uploads/20220831/d4549a4ffb93ae174d56ad438515202e.pdf)
    - [ ] **JHM1103** — DFN10; same JHM110X family. [Catalogue](https://cha.caca-chips.com/public/uploads/20220831/d4549a4ffb93ae174d56ad438515202e.pdf)
  - [ ] **G2 — High-resolution resistive-bridge / pressure SSCs**
    - [ ] **JHM1200** — 24-bit pressure-bridge interface, I²C output. [Product details](https://c.gongkong.com/PhoneVersion/ProductDetail?pId=86992)
    - [ ] **JHM1203** — 24-bit pressure-bridge interface, I²C output. [Product details](https://m.sensorexpert.com.cn/prod-detail/37572139.html) · [Catalogue](https://cha.caca-chips.com/public/uploads/20220831/d4549a4ffb93ae174d56ad438515202e.pdf)
    - [ ] **JHM140X (including JHM1400)** — 24-bit high-resolution bridge SSC, I²C/SPI output. [Family / catalogue](https://cha.caca-chips.com/public/uploads/20220831/d4549a4ffb93ae174d56ad438515202e.pdf)
  - [ ] **G3 — Automotive resistive-bridge SSC with SENT**
    - [ ] **JHM150X** — automotive pressure bridge SSC family; SENT support. [Manufacturer interview](https://en.sensorshenzhen.com/media-center/news/%E5%B1%95%E5%95%86%E8%AE%BF%E8%B0%88-%E8%B7%AF%E9%81%A5%E7%9F%A5%E9%A9%AC%E5%8A%9B%EF%BC%8C%E7%94%A8%E4%B9%85%E8%A7%81%E5%A5%BD%E8%8A%AF-%E4%B9%85%E5%A5%BD%E7%94%B5%E5%AD%90%E4%B8%93.html) · [Catalogue](https://cha.caca-chips.com/public/uploads/20220831/d4549a4ffb93ae174d56ad438515202e.pdf)
  - [ ] **G4 — Ceramic capacitive pressure SSC**
    - [ ] **JHM2102** — single-wire calibration, analog output, ceramic capacitive pressure sensors. [Product details](https://www.sensorexpert.com.cn/prod-detail/37573020.html) · [Catalogue](https://cha.caca-chips.com/public/uploads/20220831/d4549a4ffb93ae174d56ad438515202e.pdf)

**Scope:** JHM2000/JHM2031 are capacitive SSCs described mainly for environmental/humidity sensing and therefore are not yet included as dedicated pressure SSC targets.

## Implementation checklist

- [ ] Confirm supported device variants, supply voltages, wiring and communication interface.
- [ ] Implement and test transport using an affordable USB-connected microcontroller.
- [ ] Read device identification, configuration and raw measurement data where supported.
- [ ] Implement settings write, calibration and nonvolatile programming where supported.
- [ ] Validate the calibration with reference measurements and verify stored values.
- [ ] Test digital logging, diagnostics and export using the common web UI.
- [ ] Document tested hardware and limitations; then tick the individual SSC and family checkboxes.

These checkboxes describe the work to do for **Jiuhao Microelectronics (JHM)**. An SSC is only marked complete after the applicable workflow works on real hardware.
