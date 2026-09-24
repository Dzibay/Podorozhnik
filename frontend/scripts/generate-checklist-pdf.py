# -*- coding: utf-8 -*-
"""Generate lead-magnet PDF. Run: python scripts/generate-checklist-pdf.py"""
from pathlib import Path
from fpdf import FPDF

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "docs" / "checklist-10-tochek-rosta.pdf"
ARIAL = Path(r"C:\Windows\Fonts\arial.ttf")
ARIAL_BD = Path(r"C:\Windows\Fonts\arialbd.ttf")


def t(s: str) -> str:
    return s


def main() -> None:
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.add_page()
    pdf.set_left_margin(18)
    pdf.set_right_margin(18)
    pdf.add_font("ArialUni", "", str(ARIAL))
    pdf.add_font("ArialUni", "B", str(ARIAL_BD))

    def write(text: str, size: int = 11, bold: bool = False, color=(0, 0, 0), h: float = 6):
        pdf.set_x(18)
        pdf.set_text_color(*color)
        pdf.set_font("ArialUni", "B" if bold else "", size)
        pdf.multi_cell(0, h, text)

    write("10 точек роста маркетинга", 18, True, h=9)
    write("для производств, строек и сервисных компаний", 11, False, (80, 80, 80))
    pdf.ln(3)
    write(
        "Проверьте свой маркетинг. Если ответите «нет» хотя бы на 3 вопроса — "
        "система работает вполсилы."
    )
    pdf.ln(5)

    items = [
        ("1. Квалификация лидов", "Прописаны ли критерии целевой заявки (ниша, бюджет, срочность, регион)?"),
        ("2. Стоимость заявки (CPL)", "Знаете ли вы текущую стоимость целевой заявки?"),
        ("3. Конверсия сайта", "Сайт заточен под заявки или это «красивая визитка»?"),
        ("4. Сквозная аналитика", "Видите путь клиента от клика до продажи и ROMI каналов?"),
        ("5. Отчётность", "Получаете еженедельные отчёты с цифрами, а не с водой?"),
        ("6. Скрипты ОП", "У отдела продаж есть сценарии под разные типы заявок?"),
        ("7. Скорость реакции", "Сколько проходит от заявки до первого контакта? Цель — до 5 минут."),
        ("8. Скорость сайта", "Страницы грузятся быстрее 2 секунд?"),
        ("9. Правки и обновления", "Мелочи на сайте меняются за часы, а не за недели?"),
        ("10. План роста", "Есть стратегия маркетинга на 6–12 месяцев?"),
    ]
    for title, body in items:
        write(title, 12, True)
        write(body)
        pdf.ln(2)

    pdf.ln(2)
    write("Как считать результат", 12, True)
    write(
        "0–3 «да»: маркетинг теряет деньги — нужен аудит.\n"
        "4–6 «да»: потенциал роста в 2–3 раза.\n"
        "7–9 «да»: хорошая база, есть точки кратного роста.\n"
        "10 «да»: системный маркетинг."
    )
    pdf.ln(4)
    write("Хотите разбор под ваш бизнес?", 12, True)
    write(
        "Бесплатный экспресс-аудит за 24 часа:\n"
        "https://podorozhnik-agency.ru/contacts\n"
        "Телефон: 8 (995) 600-42-28"
    )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    pdf.output(str(OUT))
    print(f"Wrote {OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
