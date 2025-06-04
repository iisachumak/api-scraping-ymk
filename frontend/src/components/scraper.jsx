import React, { useState } from "react";
import "../components/scraper.css";
import Spiner from "./spiner";

function Scraper() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedEcommerce, setSelectedEcommerce] = useState("");

  const handleRadioChange = (e) => {
    setSelectedEcommerce(e.target.value);
  };

  const handleScraping = () => {
    if (!selectedEcommerce) {
      alert("Seleccioná un ecommerce antes de comenzar el scraping.");
      return;
    }

    const fileInput = document.querySelector(".form-file");
    const file = fileInput.files[0];

    if (!file) {
      alert("Subí un archivo Excel antes de comenzar.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    fetch(`http://localhost:3000/scraper-${selectedEcommerce}`, {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Datos recibidos:", data);
        setData(data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al obtener datos:", err);
        setLoading(false);
      });
  };

  return (
    <div className="container">
      <div className="container-input">
        <div className="form-container">
          <div className="input-file">
            <input className="form-file" type="file" name="" id="" />
          </div>
          <div className="ecommerce-selector">
            <input
              type="radio"
              name="ecommerce"
              value="fravega"
              onChange={handleRadioChange}
            />
            <label>Fravega</label>
            <input
              type="radio"
              name="ecommerce"
              value="barbieri"
              onChange={handleRadioChange}
            />
            <label>Oscar Barbieri</label>
            <input
              type="radio"
              name="ecommerce"
              value="castillo"
              onChange={handleRadioChange}
            />
            <label>Castillo</label>
            <input
              type="radio"
              name="ecommerce"
              value="oncity"
              onChange={handleRadioChange}
            />
            <label>OnCity</label>
          </div>
          <div className="form-btn">
            <button type="button" onClick={handleScraping}>
              Comenzar scraping
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="loading-spiner">
          <Spiner />
        </div>
      )}
      {!loading && data && data.length === 0 && (
        <p>No se pudieron cargar los datos.</p>
      )}

      {data && data.length > 0 && (
        <div className="table_component">
          <table>
            <caption className="table-title">
              Resultados de {selectedEcommerce}
            </caption>
            <thead>
              <tr>
                <th>Imagen producto</th>
                <th>Nombre producto</th>
                <th>Precio tachado</th>
                <th>Precio actual</th>
                <th>Off %</th>
                <th>Cuotas</th>
                <th>Valor envío</th>
                <th>URL producto</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>
                    <a href={item.product_img} target="_blank">
                      <img src={item.product_img} alt="" />
                    </a>
                  </td>
                  <td>{item.product_name}</td>
                  <td className="older-price">{item.older_price}</td>
                  <td className="current-price">{item.current_price}</td>
                  <td className="off">{item.off} %</td>
                  <td>{item.rules}</td>
                  <td>{item.shipping_price}</td>
                  <td>
                    <a
                      href={item.product_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.product_url}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Scraper;
