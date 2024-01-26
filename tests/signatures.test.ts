import { expect } from "chai";
import { Wallet } from "ethers";

import type { GenerateOrder } from "./exchange";
import { eth, Order } from "./exchange";

export function runSignatureTests(setupTest: any) {
  return async () => {
    let alice: Wallet;
    let bob: Wallet;
    let exchange: any;

    let generateOrder: GenerateOrder;

    let orderInput: any;
    let order: Order;
    let otherOrders: Order[];
    let orderHash: string;

    before(async () => {
      ({ alice, bob, exchange, generateOrder } = await setupTest());
    });

    beforeEach(async () => {
      order = generateOrder(alice);

      otherOrders = [generateOrder(alice, { salt: 1 }), generateOrder(alice, { salt: 2 }), generateOrder(alice, { salt: 3 })];

      orderHash = await order.hash();
      orderInput = await order.pack();
    });

    describe("personal", function () {
      beforeEach(async () => {
        order.parameters.expirationTime = (Math.floor(new Date().getTime() / 1000) + 86400).toString();
        orderHash = await order.hash();
        orderInput = await order.pack();
      });
      describe("single", function () {
        it("sent by trader no signatures", async () => {
          orderInput = await order.packNoSigs();
          expect(await exchange.connect(alice).validateSignatures(orderInput, orderHash)).to.equal(true);
        });
        it("not sent by trader no signatures", async () => {
          orderInput = await order.packNoSigs();
          expect(await exchange.validateSignatures(orderInput, orderHash)).to.equal(false);
        });
        it("not sent by trader valid signatures", async () => {
          expect(await exchange.validateSignatures(orderInput, orderHash)).to.equal(true);
        });
        it("different order", async () => {
          order.parameters.price = eth("2");
          orderInput = await order.pack();
          expect(await exchange.validateSignatures(orderInput, orderHash)).to.equal(false);
        });
        it("different signer", async () => {
          orderInput = await order.pack({ signer: bob });
          expect(await exchange.validateSignatures(orderInput, orderHash)).to.equal(false);
        });
      });

      describe("bulk sign", function () {
        it("sent by trader no signatures", async () => {
          orderInput = await order.packNoSigs();
          expect(await exchange.connect(alice).validateSignatures(orderInput, orderHash)).to.equal(true);
        });
        it("not sent by trader no signatures", async () => {
          orderInput = await order.packNoSigs();
          expect(await exchange.validateSignatures(orderInput, orderHash)).to.equal(false);
        });
        it("not sent by trader valid signatures", async () => {
          orderInput = await order.packBulk(otherOrders);
          expect(await exchange.validateSignatures(orderInput, orderHash)).to.equal(true);
        });
        it("different order", async () => {
          order.parameters.price = eth("2");
          orderInput = await order.pack();
          expect(await exchange.validateSignatures(orderInput, orderHash)).to.equal(false);
        });
        it("different signer", async () => {
          orderInput = await order.pack({ signer: bob });
          expect(await exchange.validateSignatures(orderInput, orderHash)).to.equal(false);
        });
      });
    });

    describe("oracle", function () {
      this.beforeEach(async () => {
        // to set the extraParams to 0x01, for oracle validate
        order.parameters.extraParams = "0x01";
        orderHash = await order.hash();
        orderInput = await order.pack();
      });
      // console.log("oracle value:", order.admin);  //这里写console会导致测试不生效
      it("happy", async () => {
        // console.log("oracle address:", order.admin.address);
        // console.log("orderInput:", orderInput, "\n orderHash:", orderHash, "\n\n");
        expect(await exchange.validateSignatures(orderInput, orderHash)).to.equal(true);
      });
      it("different block number", async () => {
        orderInput.blockNumber -= 1;
        expect(await exchange.validateSignatures(orderInput, orderHash)).to.equal(false);
      });
      it("different signer", async () => {
        orderInput = await order.pack({ oracle: alice });
        expect(await exchange.validateSignatures(orderInput, orderHash)).to.equal(false);
      });
      it("with bulk", async () => {
        orderInput = await order.packBulk(otherOrders);
        expect(await exchange.validateSignatures(orderInput, orderHash)).to.equal(true);
      });
    });
  };
}
