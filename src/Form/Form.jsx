import "./form.css";
import { useState } from "react";

const Form = () => {
  // Форматирование даты
  function formatDate(date) {
    const pad = (n) => n.toString().padStart(2, "0");
    return `${pad(date.getFullYear())}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
      date.getSeconds()
    )}`;
  }

  // Инициализация состояния формы
  const [formData, setFormData] = useState({
    name: "",
    tel: "",
    quantity: "",
    date: "",
    origin: "Сайт",
    dateOfDispatch: formatDate(new Date()), // Форматированная дата
    address: "",
  });

  // Состояние для статуса и ошибок
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState({});

  // Проверки валидации
  function isValidName(name) {
    const orgPrefixes = [
      "ООО",
      "АО",
      "ПАО",
      "НПАО",
      "ЗАО",
      "ОАО",
      "ОООП",
      "ПК",
      "ГУП",
      "МУП",
      "ХП",
      "КФХ",
      "НП",
      "НКО",
      "АНО",
      "ТСЖ",
      "СНТ",
      "ОПО",
      "Ф",
      "У",
      "ИП",
      "ПТ",
      "ПИФ",
      "ИТ",
    ];

    const orgRegex = new RegExp(
      `^(${orgPrefixes.join(
        "|"
      )})\\s+["“”«»][A-Za-zА-Яа-яЁё0-9\\s\\-.,'()]+["”«»]$`
    );
    const personRegex = /^[A-Za-zА-Яа-яЁё]+(?:[\s\-'][A-Za-zА-Яа-яЁё]+)*$/;

    const startsWithOrgPrefix = orgPrefixes.some((prefix) => {
      const trimmedName = name.trim();
      return (
        trimmedName.startsWith(prefix) &&
        (trimmedName.length === prefix.length ||
          trimmedName[prefix.length] === " " ||
          !/[A-Za-zА-Яа-яЁё]/.test(trimmedName[prefix.length]))
      );
    });

    if (startsWithOrgPrefix) {
      return orgRegex.test(name);
    }

    return personRegex.test(name) && name.length >= 2 && name.length <= 100;
  }

  function isValidPhone(phone) {
    const phoneRegex = /^(\+7|8)([\s\-]?\d{3}){2}[\s\-]?\d{2}[\s\-]?\d{2}$/;
    return phoneRegex.test(phone);
  }

  function isValidDate(dateString) {
    if (!dateString) return false;
    const selectedDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  }

  // Обработчик изменения полей формы
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      let updatedData = { ...prev };

      if (name === "quantity") {
        let numericValue = value.replace(/\D/g, "");
        if (numericValue.length > 0 && numericValue.startsWith("0")) {
          numericValue = numericValue.replace(/^0+/, "");
        }
        updatedData[name] = numericValue;

        if (parseInt(numericValue) < 50) {
          updatedData.address = "";
        }
      } else {
        updatedData[name] = value;
      }

      return updatedData;
    });

    let processedValue = value;

    if (name === "quantity") {
      processedValue = value.replace(/\D/g, "");
      if (processedValue.length > 0 && processedValue.startsWith("0")) {
        processedValue = processedValue.replace(/^0+/, "");
      }
    }

    // Валидация в реальном времени
    if (name === "name" && !isValidName(value)) {
      setErrors((prev) => ({
        ...prev,
        name: 'Введите корректное имя или название организации в формате: ООО "Название" или ИП "ФИО"',
      }));
    } else if (name === "tel" && !isValidPhone(value)) {
      setErrors((prev) => ({
        ...prev,
        tel: "Введите корректный номер телефона, например: +7 999 999 99 99",
      }));
    } else if (name === "date" && !isValidDate(value)) {
      setErrors((prev) => ({
        ...prev,
        date: "Дата доставки не может быть меньше сегодняшней",
      }));
    } else if (name === "quantity") {
      const isValidQuantity = /^[1-9][0-9]*$/.test(processedValue);

      if (!isValidQuantity) {
        setErrors((prev) => ({
          ...prev,
          quantity: "Введите положительное число без нуля в начале",
        }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.quantity;
          return newErrors;
        });
      }
    } else if (name === "address") {
      const addressRegex = /^[a-zA-Zа-яА-ЯёЁ0-9\s.,/()"'\-]{5,}$/u;

      if (!addressRegex.test(value.trim())) {
        setErrors((prev) => ({
          ...prev,
          address: "Введите корректный адрес (минимум 5 символов)",
        }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.address;
          return newErrors;
        });
      }
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Обновляем дату отправки перед валидацией
    const updatedFormData = {
      ...formData,
      dateOfDispatch: formatDate(new Date()),
    };

    const newErrors = {};

    if (!isValidName(updatedFormData.name)) {
      newErrors.name =
        'Введите корректное имя или название организации в формате: ООО "Название" или ИП "ФИО"';
    }
    if (!isValidPhone(updatedFormData.tel)) {
      newErrors.tel =
        "Введите корректный номер телефона, например: +7 999 999 99 99";
    }
    if (!isValidDate(updatedFormData.date)) {
      newErrors.date = "Дата доставки не может быть меньше сегодняшней";
    }
    if (!/^[1-9][0-9]*$/.test(updatedFormData.quantity)) {
      newErrors.quantity = "Количество должно быть положительным числом";
    } else if (parseInt(updatedFormData.quantity) < 1) {
      newErrors.quantity = "Количество должно быть больше 0";
    }
    if (
      parseInt(updatedFormData.quantity) >= 50 &&
      !updatedFormData.address.trim()
    ) {
      newErrors.address = "Введите адрес доставки";
    }

    // Проверка на пустое значение dateOfDispatch
    if (!updatedFormData.dateOfDispatch) {
      newErrors.dateOfDispatch = "Ошибка: дата отправки не установлена";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setStatus("sending");

    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbyRCIW1e-h9KkLFfUMsroFS4Xprh5l8FW6hteUqlxfxHqUSeVSISw-O7iNupwbb3p5_/exec ",
        {
          method: "POST",
          mode: "cors",
          cache: "no-cache",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams(updatedFormData).toString(),
        }
      );

      const result = await response.json();

      if (result.result === "success") {
        if (parseInt(updatedFormData.quantity) < 50) {
          setStatus("success-pickup");
        } else {
          setStatus("success");
        }
        setFormData({
          name: "",
          tel: "",
          quantity: "",
          date: "",
          address: "",
          origin: "Сайт",
          dateOfDispatch: formatDate(new Date()), // Сбрасываем с новой датой
        });
      } else {
        setStatus("error");
        console.error(result.error);
      }
    } catch (error) {
      setStatus("error");
      console.error("Ошибка отправки формы:", error);
    }
  };

  return (
    <section>
      <div className="container">
        <div className="form_area">
          <h1 className="title">Форма заказа молока</h1>

          <form onSubmit={handleSubmit}>
            {/* Поле: Имя / Название организации */}
            <div className="form_group">
              <label className="sub_title" htmlFor="name">
                Имя или организация
              </label>
              <input
                id="name"
                placeholder='Например: Иван, ООО "Рога и Копыта"'
                className="form_style"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Поле: Телефон */}
            <div className="form_group">
              <label className="sub_title" htmlFor="tel">
                Номер телефона
              </label>
              <input
                id="tel"
                placeholder="+7 999 999 99 99"
                className="form_style"
                type="tel"
                name="tel"
                value={formData.tel}
                onChange={handleChange}
                required
              />
            </div>

            {/* Поле: Количество молока */}
            <div className="form_group">
              <label className="sub_title" htmlFor="quantity">
                Количество молока (кг)
              </label>
              <input
                id="quantity"
                placeholder="Сколько кг молока вам нужно?"
                className="form_style"
                type="text"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                pattern="[1-9][0-9]*"
                required
              />
            </div>

            {/* Условное отображение поля адреса */}
            {parseInt(formData.quantity) >= 50 && (
              <div className="form_group">
                <label className="sub_title" htmlFor="address">
                  Адрес доставки
                </label>
                <input
                  id="address"
                  placeholder="Укажите адрес доставки"
                  className="form_style"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {/* Поле: Дата доставки */}
            <div className="form_group">
              <label className="sub_title" htmlFor="date">
                На какую дату нужно молоко
              </label>
              <input
                id="date"
                className="form_style"
                type="date"
                name="date"
                value={formData.date}
                min={new Date().toISOString().split("T")[0]}
                onChange={handleChange}
                required
              />
            </div>

            {/* Скрытые поля для отправки в Google Таблицы */}
            <input type="hidden" name="origin" value={formData.origin} />
            <input
              type="hidden"
              name="dateOfDispatch"
              value={formData.dateOfDispatch}
            />

            {/* Кнопка отправки */}
            <button
              type="submit"
              className="btn"
              disabled={status === "sending"}
            >
              {status === "sending" ? "Отправка..." : "Отправить заявку"}
            </button>

            {/* Сообщения об ошибках */}
            <div className="error-container">
              {errors.name && <p className="error-text">{errors.name}</p>}
              {errors.tel && <p className="error-text">{errors.tel}</p>}
              {errors.date && <p className="error-text">{errors.date}</p>}
              {errors.quantity && (
                <p className="error-text">{errors.quantity}</p>
              )}
              {errors.address && <p className="error-text">{errors.address}</p>}
              {errors.dateOfDispatch && (
                <p className="error-text">{errors.dateOfDispatch}</p>
              )}
            </div>

            {/* Сообщения об успехе/ошибке */}
            {status === "success" && (
              <p className="success">Заявка успешно отправлена!</p>
            )}
            {status === "success-pickup" && (
              <p className="success-pickup">
                Заявка успешно отправлена! Будем ожидать вас на ферме в д.Малый
                Сулабаш.
              </p>
            )}
            {status === "error" && (
              <p className="error">Ошибка отправки заявки.</p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};

export { Form };
