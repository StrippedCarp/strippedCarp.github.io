(function () {
  'use strict';

  function deepFreeze(target) {
    if (target && typeof target === 'object' && !Object.isFrozen(target)) {
      Object.freeze(target);
      Object.keys(target).forEach(function (key) {
        deepFreeze(target[key]);
      });
    }
    return target;
  }

  const cocktails = (window.MARALUXE_ASSETS && window.MARALUXE_ASSETS.cocktails) || {};

  window.MARALUXE_MENU_DATA = deepFreeze({
  "venue": "Maraluxe Resort and Spa",
  "menu": "bar",
  "currency": "KES",
  "currencyLabel": "Ksh.",
  "groups": [
    {
      "name": "Cocktails",
      "hidden": false,
      "categories": [
        {
          "name": "Signature Cocktails",
          "items": [
            {
              "name": "Maraluxe Coconut Velvet",
              "options": [
                {
                  "label": "",
                  "price": 1100
                }
              ],
              "tags": [
                "Signature"
              ],
              "image": {
                "t": cocktails.coconutVelvetThumb,
                "f": cocktails.coconutVelvetFull
              }
            },
            {
              "name": "Maraluxe Mango Splash",
              "options": [
                {
                  "label": "",
                  "price": 650
                }
              ],
              "tags": [
                "Signature"
              ],
              "image": {
                "t": cocktails.mangoSplashThumb,
                "f": null
              }
            },
            {
              "name": "Maraluxe Oasis",
              "options": [
                {
                  "label": "",
                  "price": 600
                }
              ],
              "tags": [
                "Signature"
              ],
              "image": {
                "t": cocktails.oasisThumb,
                "f": null
              }
            },
            {
              "name": "Maraluxe Strawberry Bliss",
              "options": [
                {
                  "label": "",
                  "price": 600
                }
              ],
              "tags": [
                "Signature"
              ],
              "image": {
                "t": cocktails.strawberryBlissThumb,
                "f": null
              }
            },
            {
              "name": "Maraluxe Tropical Sunset",
              "options": [
                {
                  "label": "",
                  "price": 800
                }
              ],
              "tags": [
                "Signature"
              ],
              "image": {
                "t": cocktails.tropicalSunsetThumb,
                "f": null
              }
            }
          ]
        },
        {
          "name": "Classic Cocktails",
          "items": [
            {
              "name": "Adios",
              "options": [
                {
                  "label": "15ml",
                  "price": 900
                },
                {
                  "label": "30ml",
                  "price": 1200
                }
              ]
            },
            {
              "name": "Cosmopolitan",
              "options": [
                {
                  "label": "",
                  "price": 600
                }
              ]
            },
            {
              "name": "Dirty Martini",
              "options": [
                {
                  "label": "",
                  "price": 700
                }
              ]
            },
            {
              "name": "Dry Martini",
              "options": [
                {
                  "label": "",
                  "price": 600
                }
              ]
            },
            {
              "name": "Gin & Tonic",
              "options": [
                {
                  "label": "",
                  "price": 500
                }
              ]
            },
            {
              "name": "Jäger Bomb",
              "options": [
                {
                  "label": "",
                  "price": 650
                }
              ]
            },
            {
              "name": "Long Island",
              "options": [
                {
                  "label": "15ml",
                  "price": 900
                },
                {
                  "label": "30ml",
                  "price": 1200
                }
              ]
            },
            {
              "name": "Margarita",
              "options": [
                {
                  "label": "",
                  "price": 600
                }
              ]
            },
            {
              "name": "Mojito",
              "options": [
                {
                  "label": "",
                  "price": 600
                }
              ]
            },
            {
              "name": "Old Fashioned",
              "options": [
                {
                  "label": "",
                  "price": 700
                }
              ]
            },
            {
              "name": "Piña Colada",
              "options": [
                {
                  "label": "",
                  "price": 800
                }
              ]
            },
            {
              "name": "Sangria",
              "options": [
                {
                  "label": "",
                  "price": 600
                }
              ]
            },
            {
              "name": "Screwdriver",
              "options": [
                {
                  "label": "",
                  "price": 550
                }
              ]
            },
            {
              "name": "Sex On The Beach",
              "options": [
                {
                  "label": "",
                  "price": 650
                }
              ]
            },
            {
              "name": "Whiskey Sour",
              "options": [
                {
                  "label": "",
                  "price": 550
                }
              ]
            }
          ]
        },
        {
          "name": "Mocktails",
          "items": [
            {
              "name": "Blue Ocean",
              "options": [
                {
                  "label": "",
                  "price": 600
                }
              ]
            },
            {
              "name": "Mango Delight",
              "options": [
                {
                  "label": "",
                  "price": 500
                }
              ]
            },
            {
              "name": "Rainbow Mocktail",
              "options": [
                {
                  "label": "",
                  "price": 600
                }
              ]
            },
            {
              "name": "Tropical Punch",
              "options": [
                {
                  "label": "",
                  "price": 550
                }
              ]
            },
            {
              "name": "Virgin Mojito",
              "options": [
                {
                  "label": "",
                  "price": 500
                }
              ]
            },
            {
              "name": "Virgin Piña Colada",
              "options": [
                {
                  "label": "",
                  "price": 500
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "name": "Beer & Cider",
      "hidden": false,
      "categories": [
        {
          "name": "Beers",
          "items": [
            {
              "name": "Balozi",
              "options": [
                {
                  "label": "Bottle",
                  "price": 350
                }
              ]
            },
            {
              "name": "Guinness",
              "options": [
                {
                  "label": "Bottle",
                  "price": 350
                },
                {
                  "label": "Can",
                  "price": 500
                }
              ]
            },
            {
              "name": "Heineken",
              "options": [
                {
                  "label": "Bottle",
                  "price": 400
                },
                {
                  "label": "Can",
                  "price": 560
                }
              ]
            },
            {
              "name": "Pilsner Lager",
              "options": [
                {
                  "label": "Bottle",
                  "price": 350
                }
              ]
            },
            {
              "name": "Tusker Lager",
              "options": [
                {
                  "label": "Bottle",
                  "price": 350
                },
                {
                  "label": "Can",
                  "price": 450
                }
              ]
            },
            {
              "name": "Tusker Lite",
              "options": [
                {
                  "label": "Bottle",
                  "price": 350
                },
                {
                  "label": "Can",
                  "price": 500
                }
              ]
            },
            {
              "name": "Tusker Malt",
              "options": [
                {
                  "label": "Bottle",
                  "price": 350
                },
                {
                  "label": "Can",
                  "price": 500
                }
              ]
            },
            {
              "name": "White Cap",
              "options": [
                {
                  "label": "Bottle",
                  "price": 350
                },
                {
                  "label": "Can",
                  "price": 500
                }
              ]
            }
          ]
        },
        {
          "name": "Ciders & Ready-to-Drink",
          "items": [
            {
              "name": "Guarana",
              "options": [
                {
                  "label": "Can",
                  "price": 400
                }
              ]
            },
            {
              "name": "Hunters Dry",
              "options": [
                {
                  "label": "Bottle",
                  "price": 400
                }
              ]
            },
            {
              "name": "Manyatta Pineapple",
              "options": [
                {
                  "label": "Bottle",
                  "price": 350
                },
                {
                  "label": "Can",
                  "price": 500
                }
              ]
            },
            {
              "name": "Savanna",
              "options": [
                {
                  "label": "Bottle",
                  "price": 450
                }
              ]
            },
            {
              "name": "Smirnoff Black Ice",
              "options": [
                {
                  "label": "Bottle",
                  "price": 350
                },
                {
                  "label": "Can",
                  "price": 400
                }
              ]
            },
            {
              "name": "Smirnoff Pineapple Punch",
              "options": [
                {
                  "label": "Bottle",
                  "price": 350
                },
                {
                  "label": "Can",
                  "price": 400
                }
              ]
            },
            {
              "name": "Smirnoff Raspberry Twist",
              "options": [
                {
                  "label": "Bottle",
                  "price": 350
                },
                {
                  "label": "Can",
                  "price": 400
                }
              ]
            },
            {
              "name": "Tusker Cider",
              "options": [
                {
                  "label": "Bottle",
                  "price": 350
                },
                {
                  "label": "Can",
                  "price": 500
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "name": "Spirits",
      "hidden": false,
      "categories": [
        {
          "name": "Whisky",
          "items": [
            {
              "name": "Ballantine's",
              "options": [
                {
                  "label": "750ml",
                  "price": 5500
                },
                {
                  "label": "1L",
                  "price": 7000
                }
              ]
            },
            {
              "name": "Bond 7",
              "options": [
                {
                  "label": "750ml",
                  "price": 2500
                }
              ]
            },
            {
              "name": "Famous Grouse",
              "options": [
                {
                  "label": "750ml",
                  "price": 5000
                },
                {
                  "label": "1L",
                  "price": 6000
                }
              ]
            },
            {
              "name": "Glenfiddich",
              "options": [
                {
                  "label": "700ml",
                  "price": 11000
                },
                {
                  "label": "1L",
                  "price": 13500
                }
              ]
            },
            {
              "name": "Grant's",
              "options": [
                {
                  "label": "750ml",
                  "price": 3900
                },
                {
                  "label": "1L",
                  "price": 4500
                }
              ]
            },
            {
              "name": "Jack Daniel's",
              "options": [
                {
                  "label": "700ml",
                  "price": 5500
                },
                {
                  "label": "1L",
                  "price": 7000
                }
              ]
            },
            {
              "name": "Jameson Irish Whiskey",
              "options": [
                {
                  "label": "750ml",
                  "price": 5500
                },
                {
                  "label": "1L",
                  "price": 6500
                }
              ]
            },
            {
              "name": "Johnnie Walker Black Label",
              "options": [
                {
                  "label": "750ml",
                  "price": 7000
                },
                {
                  "label": "1L",
                  "price": 8000
                }
              ]
            },
            {
              "name": "Johnnie Walker Double Black",
              "options": [
                {
                  "label": "750ml",
                  "price": 7500
                },
                {
                  "label": "1L",
                  "price": 9000
                }
              ]
            },
            {
              "name": "Johnnie Walker Gold Label",
              "options": [
                {
                  "label": "750ml",
                  "price": 13600
                }
              ]
            },
            {
              "name": "Johnnie Walker Green Label",
              "options": [
                {
                  "label": "750ml",
                  "price": 13800
                }
              ]
            },
            {
              "name": "Johnnie Walker Red Label",
              "options": [
                {
                  "label": "750ml",
                  "price": 4200
                },
                {
                  "label": "1L",
                  "price": 5000
                }
              ]
            },
            {
              "name": "Singleton",
              "options": [
                {
                  "label": "",
                  "price": 10000
                }
              ]
            },
            {
              "name": "VAT 69",
              "options": [
                {
                  "label": "375ml",
                  "price": 1800
                },
                {
                  "label": "750ml",
                  "price": 4000
                }
              ]
            }
          ]
        },
        {
          "name": "Vodka",
          "items": [
            {
              "name": "Flirt",
              "options": [
                {
                  "label": "700ml",
                  "price": 2700
                }
              ]
            },
            {
              "name": "KC Ginger",
              "options": [
                {
                  "label": "750ml",
                  "price": 1650
                }
              ]
            },
            {
              "name": "KC Pineapple",
              "options": [
                {
                  "label": "750ml",
                  "price": 1650
                }
              ]
            },
            {
              "name": "KC Smooth",
              "options": [
                {
                  "label": "750ml",
                  "price": 1650
                }
              ]
            },
            {
              "name": "Smirnoff",
              "options": [
                {
                  "label": "350ml",
                  "price": 1250
                },
                {
                  "label": "750ml",
                  "price": 2900
                },
                {
                  "label": "1L",
                  "price": 3800
                }
              ]
            }
          ]
        },
        {
          "name": "Gin",
          "items": [
            {
              "name": "Gilbey's",
              "options": [
                {
                  "label": "350ml",
                  "price": 1250
                },
                {
                  "label": "750ml",
                  "price": 3600
                }
              ]
            },
            {
              "name": "Gordon's",
              "options": [
                {
                  "label": "350ml",
                  "price": 1800
                },
                {
                  "label": "750ml",
                  "price": 4500
                },
                {
                  "label": "1L",
                  "price": 5500
                }
              ]
            },
            {
              "name": "Malfy Gin Rosa",
              "options": [
                {
                  "label": "750ml",
                  "price": 8000
                }
              ]
            }
          ]
        },
        {
          "name": "Rum",
          "items": [
            {
              "name": "Bacardi Blanca (Clear)",
              "options": [
                {
                  "label": "750ml",
                  "price": 4000
                }
              ]
            },
            {
              "name": "Bacardi Gold",
              "options": [
                {
                  "label": "750ml",
                  "price": 5000
                }
              ]
            },
            {
              "name": "Captain Morgan Gold",
              "options": [
                {
                  "label": "750ml",
                  "price": 2700
                }
              ]
            },
            {
              "name": "Captain Morgan Spiced",
              "options": [
                {
                  "label": "750ml",
                  "price": 4500
                }
              ]
            },
            {
              "name": "Malibu",
              "options": [
                {
                  "label": "700ml",
                  "price": 5500
                },
                {
                  "label": "1L",
                  "price": 7500
                }
              ]
            }
          ]
        },
        {
          "name": "Tequila",
          "items": [
            {
              "name": "Astral Blanco",
              "options": [
                {
                  "label": "750ml",
                  "price": 6500
                }
              ]
            },
            {
              "name": "Astral Reposado",
              "options": [
                {
                  "label": "750ml",
                  "price": 6500
                }
              ]
            },
            {
              "name": "Camino Clear",
              "options": [
                {
                  "label": "750ml",
                  "price": 4000
                }
              ]
            },
            {
              "name": "Camino Gold",
              "options": [
                {
                  "label": "750ml",
                  "price": 4000
                }
              ]
            },
            {
              "name": "Don Julio Añejo",
              "options": [
                {
                  "label": "750ml",
                  "price": 15900
                }
              ]
            },
            {
              "name": "Don Julio Blanco",
              "options": [
                {
                  "label": "750ml",
                  "price": 13200
                }
              ]
            },
            {
              "name": "Don Julio Reposado",
              "options": [
                {
                  "label": "750ml",
                  "price": 14400
                }
              ]
            },
            {
              "name": "Jose Cuervo Gold",
              "options": [
                {
                  "label": "750ml",
                  "price": 4500
                }
              ]
            },
            {
              "name": "Jose Cuervo Silver",
              "options": [
                {
                  "label": "750ml",
                  "price": 4500
                }
              ]
            }
          ]
        },
        {
          "name": "Brandy & Cognac",
          "items": [
            {
              "name": "Hennessy VS",
              "options": [
                {
                  "label": "",
                  "price": 7500
                }
              ]
            },
            {
              "name": "Hennessy VSOP",
              "options": [
                {
                  "label": "750ml",
                  "price": 13000
                },
                {
                  "label": "1L",
                  "price": 18900
                }
              ]
            },
            {
              "name": "Hennessy XO",
              "options": [
                {
                  "label": "700ml",
                  "price": 50000
                }
              ]
            },
            {
              "name": "Martell VS",
              "options": [
                {
                  "label": "700ml",
                  "price": 9000
                },
                {
                  "label": "1L",
                  "price": 11500
                }
              ]
            },
            {
              "name": "Martell VSOP",
              "options": [
                {
                  "label": "700ml",
                  "price": 18000
                },
                {
                  "label": "1L",
                  "price": 20000
                }
              ]
            },
            {
              "name": "Richot",
              "options": [
                {
                  "label": "350ml",
                  "price": 1250
                },
                {
                  "label": "750ml",
                  "price": 2900
                }
              ]
            },
            {
              "name": "Viceroy",
              "options": [
                {
                  "label": "375ml",
                  "price": 1600
                },
                {
                  "label": "750ml",
                  "price": 2500
                }
              ]
            }
          ]
        },
        {
          "name": "Liqueurs",
          "items": [
            {
              "name": "Amarula Cream",
              "options": [
                {
                  "label": "750ml",
                  "price": 5000
                }
              ]
            },
            {
              "name": "Baileys",
              "options": [
                {
                  "label": "750ml",
                  "price": 5000
                }
              ]
            },
            {
              "name": "Best Cream",
              "options": [
                {
                  "label": "750ml",
                  "price": 4500
                }
              ]
            },
            {
              "name": "Jägermeister",
              "options": [
                {
                  "label": "1L",
                  "price": 6500
                }
              ]
            },
            {
              "name": "Kahlúa Coffee",
              "options": [
                {
                  "label": "",
                  "price": 6000
                }
              ]
            },
            {
              "name": "Southern Comfort",
              "options": [
                {
                  "label": "1L",
                  "price": 5000
                }
              ]
            }
          ]
        },
        {
          "name": "Other Spirits",
          "items": [
            {
              "name": "Jinro",
              "options": [
                {
                  "label": "",
                  "price": 600
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "name": "Wine",
      "hidden": false,
      "categories": [
        {
          "name": "Sparkling",
          "items": [
            {
              "name": "Belaire Brut Gold",
              "options": [
                {
                  "label": "",
                  "price": 12000
                }
              ]
            },
            {
              "name": "Belaire Luxe Rosé",
              "options": [
                {
                  "label": "",
                  "price": 12000
                }
              ]
            },
            {
              "name": "Belaire Rare Luxe",
              "options": [
                {
                  "label": "",
                  "price": 12000
                }
              ]
            },
            {
              "name": "Belaire Rare Rosé",
              "options": [
                {
                  "label": "",
                  "price": 12000
                }
              ]
            }
          ]
        },
        {
          "name": "Red Wine",
          "items": [
            {
              "name": "4th Street",
              "options": [
                {
                  "label": "750ml",
                  "price": 1400
                }
              ]
            },
            {
              "name": "Caprice",
              "options": [
                {
                  "label": "1L",
                  "price": 1400
                }
              ]
            },
            {
              "name": "Nederburg Cabernet Sauvignon",
              "options": [
                {
                  "label": "",
                  "price": 3000
                }
              ]
            },
            {
              "name": "Nederburg Merlot",
              "options": [
                {
                  "label": "750ml",
                  "price": 3500
                }
              ]
            },
            {
              "name": "Robertson",
              "options": [
                {
                  "label": "750ml",
                  "price": 3000
                }
              ]
            }
          ]
        },
        {
          "name": "White Wine",
          "items": [
            {
              "name": "4th Street",
              "options": [
                {
                  "label": "750ml",
                  "price": 1400
                }
              ]
            },
            {
              "name": "Caprice",
              "options": [
                {
                  "label": "1L",
                  "price": 1400
                }
              ]
            },
            {
              "name": "Nederburg Sauvignon Blanc",
              "options": [
                {
                  "label": "",
                  "price": 3000
                }
              ]
            },
            {
              "name": "Robertson",
              "options": [
                {
                  "label": "750ml",
                  "price": 3000
                }
              ]
            }
          ]
        },
        {
          "name": "Wine by the Glass",
          "items": [
            {
              "name": "Cellar Cask Red",
              "options": [
                {
                  "label": "Glass",
                  "price": 400
                }
              ]
            },
            {
              "name": "House Wine",
              "options": [
                {
                  "label": "Glass",
                  "price": 500
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "name": "Shots & Singles",
      "hidden": false,
      "categories": [
        {
          "name": "Shots & Singles",
          "items": [
            {
              "name": "Amarula",
              "options": [
                {
                  "label": "Single",
                  "price": 250
                }
              ]
            },
            {
              "name": "Astral Blanco",
              "options": [
                {
                  "label": "Single",
                  "price": 200
                }
              ]
            },
            {
              "name": "Astral Reposado",
              "options": [
                {
                  "label": "Single",
                  "price": 250
                }
              ]
            },
            {
              "name": "Baileys",
              "options": [
                {
                  "label": "Single",
                  "price": 250
                }
              ]
            },
            {
              "name": "Ballantine's",
              "options": [
                {
                  "label": "Single",
                  "price": 250
                }
              ]
            },
            {
              "name": "Camino Clear",
              "options": [
                {
                  "label": "Single",
                  "price": 200
                }
              ]
            },
            {
              "name": "Camino Gold",
              "options": [
                {
                  "label": "Single",
                  "price": 200
                }
              ]
            },
            {
              "name": "Don Julio Blanco",
              "options": [
                {
                  "label": "Single",
                  "price": 500
                }
              ]
            },
            {
              "name": "Don Julio Reposado",
              "options": [
                {
                  "label": "Single",
                  "price": 550
                }
              ]
            },
            {
              "name": "Gilbey's",
              "options": [
                {
                  "label": "Single",
                  "price": 150
                }
              ]
            },
            {
              "name": "Gordon's",
              "options": [
                {
                  "label": "Single",
                  "price": 250
                }
              ]
            },
            {
              "name": "Hennessy",
              "options": [
                {
                  "label": "Single",
                  "price": 350
                }
              ]
            },
            {
              "name": "Jack Daniel's",
              "options": [
                {
                  "label": "Single",
                  "price": 250
                }
              ]
            },
            {
              "name": "Jägermeister",
              "options": [
                {
                  "label": "Single",
                  "price": 250
                }
              ]
            },
            {
              "name": "Jameson",
              "options": [
                {
                  "label": "Single",
                  "price": 250
                }
              ]
            },
            {
              "name": "Johnnie Walker Black Label",
              "options": [
                {
                  "label": "Single",
                  "price": 250
                }
              ]
            },
            {
              "name": "Johnnie Walker Double Black",
              "options": [
                {
                  "label": "Single",
                  "price": 300
                }
              ]
            },
            {
              "name": "Johnnie Walker Red Label",
              "options": [
                {
                  "label": "Single",
                  "price": 200
                }
              ]
            },
            {
              "name": "Jose Cuervo Gold",
              "options": [
                {
                  "label": "Single",
                  "price": 250
                }
              ]
            },
            {
              "name": "Jose Cuervo Silver",
              "options": [
                {
                  "label": "Single",
                  "price": 250
                }
              ]
            },
            {
              "name": "Malibu",
              "options": [
                {
                  "label": "Single",
                  "price": 200
                }
              ]
            },
            {
              "name": "Smirnoff",
              "options": [
                {
                  "label": "Single",
                  "price": 200
                }
              ]
            },
            {
              "name": "Southern Comfort",
              "options": [
                {
                  "label": "Single",
                  "price": 250
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "name": "Soft Drinks",
      "hidden": false,
      "categories": [
        {
          "name": "Water",
          "items": [
            {
              "name": "Dasani",
              "options": [
                {
                  "label": "500ml",
                  "price": 100
                },
                {
                  "label": "1L",
                  "price": 200
                }
              ]
            },
            {
              "name": "Keringet",
              "options": [
                {
                  "label": "500ml",
                  "price": 100
                },
                {
                  "label": "1L",
                  "price": 200
                }
              ]
            }
          ]
        },
        {
          "name": "Juices",
          "items": [
            {
              "name": "Afya Mango",
              "options": [
                {
                  "label": "500ml",
                  "price": 150
                }
              ]
            },
            {
              "name": "Afya Mixed Fruit",
              "options": [
                {
                  "label": "500ml",
                  "price": 150
                }
              ]
            },
            {
              "name": "Del Monte",
              "options": [
                {
                  "label": "",
                  "price": 450
                }
              ]
            },
            {
              "name": "Minute Maid Apple",
              "options": [
                {
                  "label": "400ml",
                  "price": 150
                }
              ]
            },
            {
              "name": "Minute Maid Mango",
              "options": [
                {
                  "label": "400ml",
                  "price": 150
                }
              ]
            },
            {
              "name": "Minute Maid Tropical",
              "options": [
                {
                  "label": "",
                  "price": 150
                }
              ]
            }
          ]
        },
        {
          "name": "Sodas & Mixers",
          "items": [
            {
              "name": "Assorted Soda (Glass Bottle)",
              "options": [
                {
                  "label": "300ml",
                  "price": 100
                }
              ]
            },
            {
              "name": "Coca-Cola",
              "options": [
                {
                  "label": "1.25L",
                  "price": 400
                }
              ]
            },
            {
              "name": "Gofrut Mojito",
              "options": [
                {
                  "label": "",
                  "price": 400
                }
              ]
            },
            {
              "name": "Lemonade Lime",
              "options": [
                {
                  "label": "",
                  "price": 100
                }
              ]
            },
            {
              "name": "Lime Cordial",
              "options": [
                {
                  "label": "",
                  "price": 100
                }
              ]
            },
            {
              "name": "Soda (Plastic Bottle)",
              "options": [
                {
                  "label": "500ml",
                  "price": 200
                },
                {
                  "label": "1.25L",
                  "price": 400
                }
              ]
            }
          ]
        },
        {
          "name": "Energy Drinks",
          "items": [
            {
              "name": "Red Bull",
              "options": [
                {
                  "label": "",
                  "price": 350
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "name": "Tobacco",
      "hidden": true,
      "categories": [
        {
          "name": "Cigarettes",
          "items": [
            {
              "name": "Dunhill Blue",
              "options": [
                {
                  "label": "Stick",
                  "price": 40
                },
                {
                  "label": "Pack",
                  "price": 800
                }
              ]
            },
            {
              "name": "Dunhill Double Switch",
              "options": [
                {
                  "label": "Stick",
                  "price": 40
                },
                {
                  "label": "Pack",
                  "price": 800
                }
              ]
            },
            {
              "name": "Dunhill Switch",
              "options": [
                {
                  "label": "Stick",
                  "price": 40
                },
                {
                  "label": "Pack",
                  "price": 800
                }
              ]
            },
            {
              "name": "Rothmans Kings",
              "options": [
                {
                  "label": "Stick",
                  "price": 40
                },
                {
                  "label": "Pack",
                  "price": 800
                }
              ]
            }
          ]
        }
      ]
    }
  ]
});
})();
