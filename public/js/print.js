var pdfPages = [];
let docDefinition = {};

var styles = {
  header: {
    fontSize: 22,
    bold: true,
    alignment: "center",
    margin: [0, 10, 0, 20],
    color: "#061e30",
  },
  subheader: {
    fontSize: 12,
    alignment: "center",
    // [left, top, right, bottom]
    margin: [30, 5, 30, 10],
    color: "#061e30",
  },
  tableHeader: {
    bold: true,
    alignment: "center",
    color: "#061e30",
    fillOpacity: 0.1,
    fillColor: ["stripe45d", "#1e4620"],
  },
  table: {
    fontSize: 12,
    alignment: "center",
    color: "#061e30",
    margin: [0, 10, 0, 10],
  },
  tableDesign: {
    fontSize: 12,
    alignment: "left",
    color: "#061e30",
  },
  text: {
    alignment: "justify",
  },
  link: {
    decoration: "underline",
    color: "#0074c1",
  },
};

function getBase64ImageFromURL(url) {
  return new Promise((resolve, reject) => {
    var img = new Image();
    img.setAttribute("crossOrigin", "anonymous");

    img.onload = () => {
      var canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      var ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      var dataURL = canvas.toDataURL("image/png");

      resolve(dataURL);
    };

    img.onerror = (error) => {
      reject(error);
    };

    img.src = url;
  });
}
async function convertFontToBase64(fontUrl) {
  const response = await fetch(fontUrl);
  const blob = await response.blob();
  return await new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.onloadend = () =>
      resolve(reader.result.replace(/^data:.*?;base64,/, ""));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function printProforma(component) {
  const factureProforma = JSON.parse(
    component.getAttribute("data-factureProforma")
  );
  this.getBase64ImageFromURL("/assets/header.png").then((url) => {
    Promise.all([
      convertFontToBase64("/fonts/roboto/Cambria-Font-For-Windows.ttf"),
      convertFontToBase64("/fonts/roboto/OpenSans_Condensed-Bold.ttf"),
    ])
      .then(([mediumFont, boldFont]) => {
        pdfMake.vfs["Cambria-Font-For-Windows.ttf"] = mediumFont;
        pdfMake.vfs["OpenSans_Condensed-Bold.ttf"] = boldFont;

        pdfMake.fonts = {
          MyCustomFont: {
            normal: "Cambria-Font-For-Windows.ttf",
            bold: "OpenSans_Condensed-Bold.ttf",
          },
        };

        let docDefinition = {
          defaultStyle: { font: "MyCustomFont" },
          pageSize: "A4",
          pageOrientation: "portrait",
          // [left, top, right, bottom]
          // pageMargins: [15, 120, 15, 70],

          header: {
            image: url,
            width: 595,
            height: 142,
            margin: [0, 0, 0, 0],
          },
          footer: function (currentPage, pageCount) {
            return {
              margin: 10,
              columns: [
                {
                  fontSize: 12,
                  text: [
                    {
                      text:
                        "-----------------------------------------------------------------------------------------" +
                        "\n",
                      margin: [0, 20],
                    },
                    {
                      text: currentPage.toString() + " of " + pageCount,
                    },
                  ],
                  alignment: "center",
                },
              ],
            };
          },
          content: [
            {
              columns: [
                {
                  alignment: "left",
                  // star-sized columns fill the remaining space
                  // if there's more than one star-column, available width is divided equally
                  width: "*",
                  fontSize: 13,
                  stack: [
                    {
                      // auto-sized columns have their widths based on their content
                      width: "*",
                      text: `Demande Facture Proforma N°: ${factureProforma.factureProformaCode}`,
                      alignment: "left",
                      fontSize: 15,
                      margin: [50, 120, 10, 10],
                      style: "header",
                    },
                    {
                      // auto-sized columns have their widths based on their content
                      width: "*",
                      text: `Date: ${new Date(factureProforma.createdAt).toLocaleDateString()}`,
                      alignment: "left",
                      fontSize: 10,
                      margin: [50, 0, 10, 10],
                      style: "header",
                    },
                    {
                      // auto-sized columns have their widths based on their content
                      width: "*",
                      text: `Fournisseur: ${factureProforma.fournisseur.statutjuridique} ${factureProforma.fournisseur.name}`,
                      alignment: "left",
                      fontSize: 10,
                      margin: [50, 0, 10, 10],
                      style: "header",
                    },
                  ],
                },
              ],
            },
            {
              columns: [
                { width: "*", text: "" },
                {
                  width: "auto",
                  table: {
                    style: "table",
                    // headers are automatically repeated if the table spans over multiple pages
                    // you can declare how many rows should be treated as headers
                    headerRows: 1,
                    // widths:number of columns in the table here we have 8 columns
                    widths: ["auto", "*", "*"],

                    body: [
                      [
                        {
                          text: "N°",
                          style: "tableHeader",
                        },
                        {
                          text: "Désignation",
                          style: "tableHeader",
                        },

                        {
                          text: "Quantité",
                          style: "tableHeader",
                        },
                      ],

                      ...factureProforma.medicaments.map(
                        (medicament, index) => {
                          return [
                            { text: index + 1, style: "table" },
                            {
                              text: medicament.medicamentId.designation,
                              style: "table",
                            },
                            { text: medicament.quantity, style: "table" },
                          ];
                        }
                      ),
                    ],
                  },
                },
                { width: "*", text: "" },
              ],
            },
          ],

          // Define styles
          styles,
        };
        pdfMake.createPdf(docDefinition).open();
      })
      .catch((error) => {
        console.error;
      });
  });
}
function printBC(component) {
  const bonDeCommande = JSON.parse(component.getAttribute("data-bc"));

  this.getBase64ImageFromURL("/assets/header.png").then((url) => {
    Promise.all([
      convertFontToBase64("/fonts/roboto/Cambria-Font-For-Windows.ttf"),
      convertFontToBase64("/fonts/roboto/OpenSans_Condensed-Bold.ttf"),
    ])
      .then(([mediumFont, boldFont]) => {
        pdfMake.vfs["Cambria-Font-For-Windows.ttf"] = mediumFont;
        pdfMake.vfs["OpenSans_Condensed-Bold.ttf"] = boldFont;

        pdfMake.fonts = {
          MyCustomFont: {
            normal: "Cambria-Font-For-Windows.ttf",
            bold: "OpenSans_Condensed-Bold.ttf",
          },
        };

        let docDefinition = {
          defaultStyle: { font: "MyCustomFont" },
          pageSize: "A4",
          pageOrientation: "portrait",
          // [left, top, right, bottom]
          // pageMargins: [15, 120, 15, 70],

          header: {
            image: url,
            width: 595,
            height: 142,
            margin: [0, 0, 0, 0],
          },

          content: [
            {
              columns: [
                {
                  alignment: "left",
                  // star-sized columns fill the remaining space
                  // if there's more than one star-column, available width is divided equally
                  width: "50%",
                  fontSize: 13,
                  stack: [
                    {
                      // auto-sized columns have their widths based on their content
                      width: "*",
                      text: `BON DE COMMANDE N°: ${bonDeCommande.bonCommandeCode}`,
                      alignment: "left",
                      fontSize: 13,
                      margin: [0, 120, 0, 0],
                      style: "header",
                    },
                    {
                      // auto-sized columns have their widths based on their content
                      width: "*",
                      text: `Facture Proforma N°: ${bonDeCommande.factureProformaId ? bonDeCommande.factureProformaId.factureProformaCode : ""}`,
                      alignment: "left",
                      fontSize: 13,
                      margin: [0, 0, 0, 0],
                      style: "header",
                    },
                  ],
                },
                {
                  width: "20%",
                  stack: [],
                },
                {
                  width: "38%",
                  stack: [

                    {
                      // auto-sized columns have their widths based on their content
                      width: "*",
                      text: `Date: ${new Date(bonDeCommande.createdAt).toLocaleDateString()}`,
                      alignment: "left",
                      fontSize: 11,
                      margin: [0, 120, 0, 0],
                      style: "subheader",
                    },
                    {
                      // auto-sized columns have their widths based on their content
                      width: "*",
                      text: `Destinataire: ${bonDeCommande.fournisseurId.statutjuridique} ${bonDeCommande.fournisseurId.name}`,
                      alignment: "left",
                      fontSize: 10,
                      margin: [0, 0, 0, 0],
                      style: "subheader",
                    },
                    {
                      // auto-sized columns have their widths based on their content
                      width: "*",
                      text: `Téléphone: ${bonDeCommande.fournisseurId.mobile || "/"}`,
                      alignment: "left",
                      fontSize: 11,
                      margin: [0, 0, 0, 0],
                      style: "subheader",
                    },
                    {
                      // auto-sized columns have their widths based on their content
                      width: "*",
                      text: `Fax: ${bonDeCommande.fournisseurId.fax || "/"}`,
                      alignment: "left",
                      fontSize: 11,
                      margin: [0, 0, 0, 0],
                      style: "subheader",
                    },
                    {
                      // auto-sized columns have their widths based on their content
                      width: "*",
                      text: `Email: ${bonDeCommande.fournisseurId.email || "/"}`,
                      alignment: "left",
                      fontSize: 11,
                      margin: [0, 0, 0, 0],
                      style: "subheader",
                    },
                    {
                      // auto-sized columns have their widths based on their content
                      width: "*",
                      text: `NRC: ${bonDeCommande.fournisseurId.nrc || "/"}`,
                      alignment: "left",
                      fontSize: 11,
                      margin: [0, 0, 0, 0],
                      style: "subheader",
                    },
                    {
                      // auto-sized columns have their widths based on their content
                      width: "*",
                      text: `NIF: ${bonDeCommande.fournisseurId.nif || "/"}`,
                      alignment: "left",
                      fontSize: 11,
                      margin: [0, 0, 0, 0],
                      style: "subheader",
                    },
                    {
                      // auto-sized columns have their widths based on their content
                      width: "*",
                      text: `N° Article: ${bonDeCommande.fournisseurId.narticle || "/"}`,
                      alignment: "left",
                      fontSize: 11,
                      margin: [0, 0, 0, 0],
                      style: "subheader",
                    },
                    {
                      // auto-sized columns have their widths based on their content
                      width: "*",
                      text: `NIS: ${bonDeCommande.fournisseurId.nis || "/"}`,
                      alignment: "left",
                      fontSize: 11,
                      margin: [0, 0, 0, 0],
                      style: "subheader",
                    },
                  ],
                },
              ],
            },
            {
              stack: [
                { width: "*", text: "" },
                {
                  width: "100%",
                  table: {
                    style: "table",
                    // headers are automatically repeated if the table spans over multiple pages
                    // you can declare how many rows should be treated as headers
                    headerRows: 1,
                    // widths:number of columns in the table here we have 8 columns
                    widths: ["8%", "12%", "*", "12%"],

                    body: [
                      [
                        {
                          text: "N°",
                          style: "tableHeader",
                        },
                        {
                          text: "REF",
                          style: "tableHeader",
                        },
                        {
                          text: "Désignation",
                          style: "tableHeader",
                        },

                        {
                          text: "Quantité",
                          style: "tableHeader",
                        },
                      ],

                      ...bonDeCommande.medicaments.map((medicament, index) => {
                        return [
                          { text: index + 1, style: "table" },
                          {
                            text: medicament.medicamentId.code_pch
                              ? medicament.medicamentId.code_pch
                              : "/",
                            style: "table",
                          },
                          {
                            text: medicament.medicamentId.designation,
                            style: "table",
                          },
                          {
                            text:
                              medicament.orderQuantity < 10
                                ? "0" + medicament.orderQuantity
                                : medicament.orderQuantity,
                            style: "table",
                          },
                        ];
                      }),
                    ],
                  },
                },
                // { width: "100%", text: "Responsable",style:"header",alignment: "right",fontSize:15,margin: [0, 0, 10, 0], },
              ],
              // stack:[

              // ]

            },
            {
              stack: [
                // Space before signature
                {
                  text: "Responsable",
                  style: "header",
                  alignment: "right",
                  fontSize: 15,
                  // [left, top, right, bottom]
                  // margin: [0, 50, 10, 0], // Adjust margins as needed
                },

              ],
              absolutePosition: { x: -700, y: 700 }, // Fixed position at bottom-right
            },

          ],

          // Define styles
          styles,
        };
        pdfMake.createPdf(docDefinition).open();
      })
      .catch((error) => {
        console.error;
      });
  });
}
function printBonReception(component) {
  const bonReception = JSON.parse(component.getAttribute("data-reception"));

  this.getBase64ImageFromURL("/assets/header.png").then((url) => {
    Promise.all([
      convertFontToBase64("/fonts/roboto/Cambria-Font-For-Windows.ttf"),
      convertFontToBase64("/fonts/roboto/OpenSans_Condensed-Bold.ttf"),
    ])
      .then(([mediumFont, boldFont]) => {
        pdfMake.vfs["Cambria-Font-For-Windows.ttf"] = mediumFont;
        pdfMake.vfs["OpenSans_Condensed-Bold.ttf"] = boldFont;

        pdfMake.fonts = {
          MyCustomFont: {
            normal: "Cambria-Font-For-Windows.ttf",
            bold: "OpenSans_Condensed-Bold.ttf",
          },
        };

        let docDefinition = {
          defaultStyle: { font: "MyCustomFont" },
          pageSize: "A4",
          pageOrientation: "portrait",
          // [left, top, right, bottom]
          // pageMargins: [15, 120, 15, 70],

          header: {
            image: url,
            width: 595,
            height: 142,
            margin: [0, 0, 0, 0],
          },

          content: [
            {
              margin: [0, 95, 0, 0],
              stack: [
                {

                  columns: [
                    {
                      alignment: "left",
                      // star-sized columns fill the remaining space
                      // if there's more than one star-column, available width is divided equally

                      stack: [
                        {
                          // auto-sized columns have their widths based on their content
                          width: "*",
                          text: `BON DE Reception N°: ${bonReception.bonReceptionCode}`,
                          alignment: "left",
                          fontSize: 13,
                          // margin: [0, 120, 0, 10],
                          style: "header",
                        },

                      ],
                    },
                    {
                      width: "25%",
                      stack: [],
                    },
                    {
                      width: "25%",
                      stack: [
                        {
                          // auto-sized columns have their widths based on their content
                          width: "*",
                          text: `Date: ${new Date(bonReception.createdAt).toLocaleDateString()}`,
                          alignment: "left",
                          fontSize: 11,
                          // margin: [0, 120, 0, 0],
                          style: "header",
                           // [left, top, right, bottom]
                          margin: [30, 10, 0, 20],
                        },

                      ],
                    },
                  ],
                },
                {
                  // auto-sized columns have their widths based on their content
                  width: "*",
                  text: `Affaire suivie par Mr: ${bonReception.createdBy.username}`,
                  alignment: "left",
                  fontSize: 13,
                  // [left, top, right, bottom]
                  margin: [200, 0, 0, 0],
                  style: "subheader",
                },
                {
                  // auto-sized columns have their widths based on their content
                  width: "*",
                  text: `Identification du fournisseur: ${bonReception.fournisseurId.name}`,
                  alignment: "left",
                  fontSize: 13,
                  // [left, top, right, bottom]
                  margin: [200, 0, 0, 10],
                  style: "subheader",
                },
              ],
            },
            {
              width: "100%",
              alignment: "center",
              table: {
                style: "table",

                // headers are automatically repeated if the table spans over multiple pages
                // you can declare how many rows should be treated as headers
                headerRows: 4,
                // widths:number of columns in the table here we have 8 columns
                widths: ["*", "*", "*"],
                body: [
                  [
                    {
                      text: `BON DE COMMANDE N°: ${bonReception.bonCommandeId.code ? bonReception.bonCommandeId.code : ''}`,
                      style: "table",
                    },
                    {
                      text: `BON DE LIVRAISON: ${bonReception.bonLivraison.numero}`,
                      style: "table",
                    },
                    {
                      text: `Facture: ${bonReception.facture.numero}`,
                      style: "table",
                    },


                  ],
                  [
                    {
                      text: `Du: ${bonReception.bonCommandeId ? new Date(bonReception.bonCommandeId.date).toLocaleDateString() : 'N/A'}`,
                      style: "table",
                    },

                    {
                      text: `Du: ${bonReception.bonLivraison.date ? new Date(bonReception.bonLivraison.date).toLocaleDateString() : 'N/A'}`,
                      style: "table",
                    },
                    {
                      text: `Du: ${bonReception.facture.date ? new Date(bonReception.facture.date).toLocaleDateString() : 'N/A'}`,
                      style: "table",
                    },

                  ],
                  [
                    {
                      text: `NOMBRE DE COLIS: `,
                      style: "table",
                      colSpan: 2
                    },
                    {},
                    {
                      text: `${bonReception.nombreColis ? (bonReception.nombreColis < 10 ? "0" + bonReception.nombreColis : bonReception.nombreColis) : 0}`,
                      style: "table",
                    },

                  ],
                  [
                    {
                      text: `RECU CONFORM LE: `,
                      style: "table",
                      colSpan: 2
                    },
                    {},
                    {
                      text: `${new Date(bonReception.dateReception).toLocaleString()}`,
                      style: "table",
                    },

                  ]


                ],
              },
            },
            {
              stack: [
                {
                  // auto-sized columns have their widths based on their content
                  width: "*",
                  text: `Observation Constatée: ${bonReception.observation}`,
                  alignment: "left",
                  fontSize: 13,
                  // margin: [0, 120, 0, 10],
                  style: "header",
                },
              ]
            },
            // ==================== Produit Manquant ==============================
            {
              stack: [
                // [left, top, right, bottom]
                { width: "*", text: "Produit Manquant", alignment: "left", fontSize: 13, margin: [0, 5, 30, 5],bold:true },
                {
                  width: "100%",
                  table: {
                    style: "table",
                    // headers are automatically repeated if the table spans over multiple pages
                    // you can declare how many rows should be treated as headers
                    headerRows: 1,
                    // widths:number of columns in the table here we have 8 columns
                    widths: ["8%", "12%", "*", "12%"],

                    body: [
                      [
                        {
                          text: "N°",
                          style: "tableHeader",
                        },
                        {
                          text: "CODE",
                          style: "tableHeader",
                        },
                        {
                          text: "Désignation",
                          style: "tableHeader",
                        },

                        {
                          text: "Quantité",
                          style: "tableHeader",
                        },
                      ],

                      ...bonReception.manque.map((item, index) => {
                        return [
                          { text: index + 1, style: "table" },
                          {
                            text: item.medicamentId.code_interne
                              ? item.medicamentId.code_interne
                              : "/",
                            style: "table",
                          },
                          {
                            text: medicament.medicamentId.designation,
                            style: "table",
                          },
                          {
                            text:
                              medicament.quantity < 10
                                ? "0" + medicament.quantity
                                : medicament.quantity,
                            style: "table",
                          },
                        ];
                      }),
                    ],
                  },
                },
                // =================== Produit Surplus ==================================
                { width: "*", text: "Produit Surplus", alignment: "left", fontSize: 13, margin: [0, 5, 30, 5],bold:true },
                {
                  width: "100%",
                  table: {
                    style: "table",
                    // headers are automatically repeated if the table spans over multiple pages
                    // you can declare how many rows should be treated as headers
                    headerRows: 1,
                    // widths:number of columns in the table here we have 8 columns
                    widths: ["8%", "12%", "*", "12%"],

                    body: [
                      [
                        {
                          text: "N°",
                          style: "tableHeader",
                        },
                        {
                          text: "CODE",
                          style: "tableHeader",
                        },
                        {
                          text: "Désignation",
                          style: "tableHeader",
                        },

                        {
                          text: "Quantité",
                          style: "tableHeader",
                        },
                      ],

                      ...bonReception.surplus.map((item, index) => {
                        return [
                          { text: index + 1, style: "table" },
                          {
                            text: item.medicamentId.code_interne
                              ? item.medicamentId.code_interne
                              : "/",
                            style: "table",
                          },
                          {
                            text: medicament.medicamentId.designation,
                            style: "table",
                          },
                          {
                            text:
                              medicament.quantity < 10
                                ? "0" + medicament.quantity
                                : medicament.quantity,
                            style: "table",
                          },
                        ];
                      }),
                    ],
                  },
                },
                {
                  stack: [
                    // Space before signature
                    {
                      text: "Signature et Cachet",
                      style: "header",
                      alignment: "right",
                      fontSize: 15,
                      // [left, top, right, bottom]
                      // margin: [0, 50, 10, 0], // Adjust margins as needed
                    },

                  ],
                  absolutePosition: { x: -700, y: 720 }, // Fixed position at bottom-right
                },
              ],
            },
          ],

          // Define styles
          styles,
        };
        pdfMake.createPdf(docDefinition).open();
      })
      .catch((error) => {
        console.error;
      });
  });
}
