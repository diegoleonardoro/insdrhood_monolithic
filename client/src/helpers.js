
export const isInCart = (product, cartItems) => {

  // return cartItems.find(item => {
  //   if (product.tShirtColor) {

  //     console.log("product", product)
  //     console.log("item", item)
  //     // Check both id and tShirtColor
  //     return  item.color === product.color;
  //   } else {
  //     // Check only id
  //     return item.id === product.id;
  //   }
  // });


  return cartItems.find(item => item.id === product.id);
}