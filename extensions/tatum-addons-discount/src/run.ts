import type {
  RunInput,
  FunctionRunResult,
} from "../generated/api";

const NO_CHANGES: FunctionRunResult = {
  operations: [],
};

export function run(input: RunInput): FunctionRunResult {
  const operations = [];
  let tatumInCart = false;
  let strapDiscountApplied = false;
  let addonCount = 0;

  input.cart.lines.forEach((cartLine) => {
    if (cartLine.merchandise.product.handle === "tatum") {
      tatumInCart = true;
    }
    if (cartLine.merchandise.product.handle === "strap" && cartLine.customAttributes.some(attr => attr.key === "__upsell_addon_added" && attr.value === "true")) {
      addonCount++;
    }
  });

  input.cart.lines.forEach((cartLine) => {
    if (cartLine.merchandise.product.handle === "strap") {
      if (tatumInCart && !strapDiscountApplied && addonCount === 1) {
        operations.push({
          type: "discount",
          value: {
            percentage: {
              value: 10.0,
            },
          },
          cartLineId: cartLine.id,
        });
        strapDiscountApplied = true;
      } else {
        operations.push({
          type: "discount",
          value: {
            percentage: {
              value: 0.0,
            },
          },
          cartLineId: cartLine.id,
        });
      }
    }
  });

  return operations.length > 0 ? { operations } : NO_CHANGES;
};
