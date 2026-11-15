import { Router } from "express";
import { UpdateCategoryController } from "./controllers/category/UpdateCategoryController.js";
import { CreateUserController } from "./controllers/user/CreateUserController.js";
import { validateSchema } from "./middlewares/validateSchema.js";
import { CreateUserSchema } from "./schema/userSchema.js";
import { AuthUserController } from "./controllers/user/AuthUserController.js";
import { isAuthenticated } from "./middlewares/isAuthenticated.js";
import { DetailUserController } from "./controllers/user/DetailUserController.js";
import { CreateStoreController } from "./controllers/stores/CreateStoreController.js";
import { CreateStoreSchema, UpdateStoreSchema } from "./schema/storeSchema.js";
import {
  CreateCategorySchema,
  UpdateCategorySchema,
} from "./schema/categorySchema.js";
import { DetailProductController } from "./controllers/product/DetailProductController.js";
import { isAdminOrModerator } from "./middlewares/isAdminOrModerator.js";
import { ListStoresController } from "./controllers/stores/ListStoresController.js";
import { UpdateStoreController } from "./controllers/stores/UpdateStoreController.js";
import { CreateCategoryController } from "./controllers/category/CreateCategoryController.js";
import { ListCategoriesController } from "./controllers/category/ListCategoriesController.js";
import { CreateProductController } from "./controllers/product/CreateProductController.js";
import {
  CreateProductSchema,
  CreateProductVariantSchema,
  ListProductsSchema,
  ListProductVariantsSchema,
  UpdateProductCategoriesSchema,
  UpdateProductSchema,
  UpdateProductVariantSchema,
} from "./schema/productSchema.js";
import { ListProductsController } from "./controllers/product/ListProductsController.js";
import { UpdateProductController } from "./controllers/product/UpdateProductController.js";
import { UpdateProductCategoriesController } from "./controllers/product/UpdateProductCategoriesController.js";
import { CreateProductVariantController } from "./controllers/product/CreateProductVariantController.js";
import { ListProductVariantsController } from "./controllers/product/ListProductVariantsController.js";
import { UpdateProductVariantController } from "./controllers/product/UpdateProductVariantController.js";
import { CreateDeliveryAreaController } from "./controllers/deliveryArea/CreateDeliveryAreaController.js";
import {
  CreateDeliveryAreaSchema,
  ListDeliveryAreasSchema,
  UpdateDeliveryAreaSchema,
} from "./schema/deliveryAreaSchema.js";
import { ListDeliveryAreasController } from "./controllers/deliveryArea/ListDeliveryAreasController.js";
import { DetailPublicDeliveryAreaController } from "./controllers/deliveryArea/DetailPublicDeliveryAreaController.js";
import {
  DetailPublicDeliveryAreaSchema,
  SearchPublicDeliveryAreasSchema,
} from "./schema/publicDeliveryAreaSchema.js";
import { SearchPublicDeliveryAreasController } from "./controllers/deliveryArea/SearchPublicDeliveryAreasController.js";
import { UpdateDeliveryAreaController } from "./controllers/deliveryArea/UpdateDeliveryAreaController.js";
import { PublicListProductsController } from "./controllers/product/PublicListProductsController.js";
import { publicRateLimiter } from "./middlewares/rateLimiter.js";
import { PublicListCategoriesController } from "./controllers/category/PublicListCategoriesController.js";
import { PublicDetailStoreController } from "./controllers/stores/PublicDetailStoreController.js";
import { PublicDetailProductController } from "./controllers/product/PublicDetailProductController.js";
import { PublicProductParamsSchema } from "./schema/publicProductSchema.js";
import { ListUsersController } from "./controllers/user/ListUsersController.js";
import { DashboardController } from "./controllers/dashboard/DashboardController.js";
import { CreateCheckoutController } from "./controllers/checkout/CreateCheckoutController.js";
import { CreateCheckoutSchema } from "./schema/checkoutSchema.js";
import { ListOrdersController } from "./controllers/checkout/ListOrdersController.js";
import { UpdateOrderStatusController } from "./controllers/checkout/UpdateOrderStatusController.js";
import {
  ListOrdersSchema,
  UpdateOrderStatusSchema,
} from "./schema/ordersSchema.js";
import { PaymentMethodsController } from "./controllers/paymentMethods/PaymentMethodsController.js";
import { AcceptedCardsController } from "./controllers/paymentMethods/AcceptedCardsController.js";
import { GetPublicCartPricesController } from "./controllers/product/GetPublicCartPricesController.js";
import { PublicCartPricesSchema } from "./schema/publicCartPricesSchema.js";

const router = Router();
const paymentMethodsController = new PaymentMethodsController();
const acceptedCardsController = new AcceptedCardsController();

router.get("/", (_, res) => {
  res.json({ status: "ok", health: "/health" });
});

router.get("/health", (_, res) => {
  res.send("OK");
});

router.get("/public/payment-methods", paymentMethodsController.listPublic);
router.get("/public/accepted-cards", acceptedCardsController.listPublic);
router.get(
  "/accepted-cards",
  isAuthenticated,
  isAdminOrModerator,
  acceptedCardsController.list,
);
router.post(
  "/accepted-cards",
  isAuthenticated,
  isAdminOrModerator,
  acceptedCardsController.create,
);
router.patch(
  "/accepted-cards/:id/active",
  isAuthenticated,
  isAdminOrModerator,
  acceptedCardsController.updateActive,
);
router.put(
  "/accepted-cards/:id",
  isAuthenticated,
  isAdminOrModerator,
  acceptedCardsController.update,
);
router.delete(
  "/accepted-cards/:id",
  isAuthenticated,
  isAdminOrModerator,
  acceptedCardsController.delete,
);
router.get(
  "/payment-methods",
  isAuthenticated,
  isAdminOrModerator,
  paymentMethodsController.list,
);
router.patch(
  "/payment-methods/:id/active",
  isAuthenticated,
  isAdminOrModerator,
  paymentMethodsController.updateActive,
);

router.post(
  "/public/cart-prices",
  publicRateLimiter,
  validateSchema(PublicCartPricesSchema),
  new GetPublicCartPricesController().handle,
);

router.post(
  "/public/checkout",
  publicRateLimiter,
  validateSchema(CreateCheckoutSchema),
  new CreateCheckoutController().handle,
);

router.get(
  "/orders",
  isAuthenticated,
  isAdminOrModerator,
  validateSchema(ListOrdersSchema),
  new ListOrdersController().handle,
);

router.patch(
  "/orders/:id/status",
  isAuthenticated,
  isAdminOrModerator,
  validateSchema(UpdateOrderStatusSchema),
  new UpdateOrderStatusController().handle,
);

router.get("/me", isAuthenticated, new DetailUserController().handle);

router.post(
  "/users",
  validateSchema(CreateUserSchema),
  new CreateUserController().handle,
);

router.post("/session", new AuthUserController().handle);

router.post(
  "/stores",
  isAuthenticated,
  isAdminOrModerator,
  validateSchema(CreateStoreSchema),
  new CreateStoreController().handle,
);

router.get(
  "/stores",
  isAuthenticated,
  isAdminOrModerator,
  new ListStoresController().handle,
);

router.patch(
  "/store/:id",
  isAuthenticated,
  isAdminOrModerator,
  validateSchema(UpdateStoreSchema),
  new UpdateStoreController().handle,
);

router.post(
  "/categories",
  isAuthenticated,
  isAdminOrModerator,
  validateSchema(CreateCategorySchema),
  new CreateCategoryController().handle,
);

router.get(
  "/categories",
  isAuthenticated,
  isAdminOrModerator,
  new ListCategoriesController().handle,
);

router.patch(
  "/categories/:id",
  isAuthenticated,
  isAdminOrModerator,
  validateSchema(UpdateCategorySchema),
  new UpdateCategoryController().handle,
);

router.post(
  "/products",
  isAuthenticated,
  isAdminOrModerator,
  validateSchema(CreateProductSchema),
  new CreateProductController().handle,
);

router.get(
  "/products",
  isAuthenticated,
  isAdminOrModerator,
  validateSchema(ListProductsSchema),
  new ListProductsController().handle,
);

router.get(
  "/products/:id",
  isAuthenticated,
  isAdminOrModerator,
  new DetailProductController().handle,
);

router.patch(
  "/products/:id",
  isAuthenticated,
  isAdminOrModerator,
  validateSchema(UpdateProductSchema),
  new UpdateProductController().handle,
);

router.put(
  "/products/:productId/categories",
  isAuthenticated,
  isAdminOrModerator,
  validateSchema(UpdateProductCategoriesSchema),
  new UpdateProductCategoriesController().handle,
);

router.post(
  "/products/:productId/variants",
  isAuthenticated,
  isAdminOrModerator,
  validateSchema(CreateProductVariantSchema),
  new CreateProductVariantController().handle,
);

router.get(
  "/products/:productId/variants",
  isAuthenticated,
  isAdminOrModerator,
  validateSchema(ListProductVariantsSchema),
  new ListProductVariantsController().handle,
);

router.patch(
  "/products/:productId/variants/:variantId",
  isAuthenticated,
  isAdminOrModerator,
  validateSchema(UpdateProductVariantSchema),
  new UpdateProductVariantController().handle,
);

router.post(
  "/delivery-areas",
  isAuthenticated,
  isAdminOrModerator,
  validateSchema(CreateDeliveryAreaSchema),
  new CreateDeliveryAreaController().handle,
);

router.get(
  "/delivery-areas",
  isAuthenticated,
  isAdminOrModerator,
  validateSchema(ListDeliveryAreasSchema),
  new ListDeliveryAreasController().handle,
);

router.get(
  "/public/delivery-areas",
  publicRateLimiter,
  validateSchema(SearchPublicDeliveryAreasSchema),
  new SearchPublicDeliveryAreasController().handle,
);

router.get(
  "/public/delivery-areas/:id",
  publicRateLimiter,
  validateSchema(DetailPublicDeliveryAreaSchema),
  new DetailPublicDeliveryAreaController().handle,
);

router.patch(
  "/delivery-areas/:id",
  isAuthenticated,
  isAdminOrModerator,
  validateSchema(UpdateDeliveryAreaSchema),
  new UpdateDeliveryAreaController().handle,
);

router.get(
  "/public/products",
  publicRateLimiter,
  validateSchema(ListProductsSchema),
  new PublicListProductsController().handle,
);

router.get(
  "/public/categories",
  publicRateLimiter,
  new PublicListCategoriesController().handle,
);

router.get(
  "/public/products/:id",
  publicRateLimiter,
  validateSchema(PublicProductParamsSchema),
  new PublicDetailProductController().handle,
);

router.get(
  "/public/store",
  publicRateLimiter,
  new PublicDetailStoreController().handle,
);

router.get(
  "/users",
  isAuthenticated,
  isAdminOrModerator,
  new ListUsersController().handle,
);

router.get(
  "/dashboard",
  isAuthenticated,
  isAdminOrModerator,
  new DashboardController().handle,
);

export default router;
