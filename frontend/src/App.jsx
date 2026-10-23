import { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Coins,
  LayoutGrid,
  Package2,
  Plus,
  ReceiptText,
  ShoppingCart,
  Trash2,
} from 'lucide-react';

const STORAGE_KEY_ARTICLES = 'erp-weihnachtsmarkt-articles';
const STORAGE_KEY_TOPPINGS = 'erp-weihnachtsmarkt-toppings';
const STORAGE_KEY_ORDERS = 'erp-weihnachtsmarkt-orders';
const STORAGE_KEY_EXPENSES = 'erp-weihnachtsmarkt-expenses';

const defaultArticles = [
  { id: 'art-1', name: 'Crepe', price: 4.5, costPrice: 1.7, category: 'Süß', stock: 48 },
  { id: 'art-2', name: 'Waffel', price: 3.8, costPrice: 1.4, category: 'Süß', stock: 36 },
  { id: 'art-3', name: 'Heiße Schokolade', price: 3.2, costPrice: 1.2, category: 'Getränk', stock: 62 },
];

const defaultToppings = [
  { id: 'top-1', name: 'Nutella', price: 1.2 },
  { id: 'top-2', name: 'Erdbeeren', price: 1.5 },
  { id: 'top-3', name: 'Krokant', price: 1.1 },
];

const defaultOrders = [
  {
    id: 'ORD-1001',
    customer: 'Anna M.',
    status: 'offen',
    createdAt: '2026-10-21T09:15:00.000Z',
    total: 11.8,
    items: [{ articleName: 'Crepe', quantity: 2, toppings: ['Nutella', 'Krokant'] }],
  },
  {
    id: 'ORD-1002',
    customer: 'Müller',
    status: 'offen',
    createdAt: '2026-10-21T10:05:00.000Z',
    total: 9.5,
    items: [{ articleName: 'Waffel', quantity: 1, toppings: ['Erdbeeren'] }],
  },
];

const defaultExpenses = [
  { id: 'exp-1', title: 'Mehl und Zutaten', category: 'Material', amount: 120, occurredOn: '2026-10-21', note: 'Grundstoffe für Crepes' },
  { id: 'exp-2', title: 'Gas & Betrieb', category: 'Betriebskosten', amount: 80, occurredOn: '2026-10-22', note: 'Heizung und Betrieb' },
];

const formatMoney = (value) =>
  new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(Number(value || 0));

function useStoredState(key, fallback) {
  const [state, setState] = useState(() => {
    const stored = localStorage.getItem(key);
    if (!stored) {
      return fallback;
    }

    try {
      return JSON.parse(stored);
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
}

function PageHeader({ title, subtitle, showBack = false }) {
  return (
    <div className="page-header">
      {showBack ? (
        <Link to="/" className="back-link">
          <ArrowLeft size={18} /> Zurück
        </Link>
      ) : null}
      <div>
        {subtitle ? <span className="eyebrow">{subtitle}</span> : null}
        <h1>{title}</h1>
      </div>
    </div>
  );
}

function DashboardPage({ articles, toppings, orders, expenses }) {
  const openOrders = orders.filter((order) => order.status === 'offen');
  const totalRevenue = orders
    .filter((order) => order.status !== 'erledigt')
    .reduce((sum, order) => sum + Number(order.total || 0), 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const netBalance = totalRevenue - totalExpenses;

  const quickLinks = [
    {
      to: '/offene-auftraege',
      title: 'Offene Aufträge',
      description: `${openOrders.length} wartende Bestellungen`,
      accent: 'orange',
      icon: ClipboardList,
    },
    {
      to: '/artikel',
      title: 'Artikel',
      description: `${articles.length} Produkte gepflegt`,
      accent: 'blue',
      icon: Package2,
    },
    {
      to: '/bestellungen',
      title: 'Bestellungen',
      description: 'Neue Bestellung erfassen',
      accent: 'pink',
      icon: ShoppingCart,
    },
    {
      to: '/ausgaben',
      title: 'Ausgaben',
      description: `${expenses.length} Einträge`,
      accent: 'blue',
      icon: ReceiptText,
    },
    {
      to: '/finanzen',
      title: 'Finanzen',
      description: 'Ertrag und Wirtschaftlichkeit',
      accent: 'green',
      icon: Coins,
    },
  ];

  const cards = [
    { label: 'Offene Aufträge', value: openOrders.length, accent: 'orange' },
    { label: 'Artikel', value: articles.length, accent: 'blue' },
    { label: 'Toppings', value: toppings.length, accent: 'pink' },
    { label: 'Umsatz', value: formatMoney(totalRevenue), accent: 'green' },
    { label: 'Ausgaben', value: formatMoney(totalExpenses), accent: 'blue' },
    { label: 'Saldo', value: formatMoney(netBalance), accent: 'green' },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Übersicht" />

      <div className="dashboard-links">
        {quickLinks.map(({ to, title, description, accent, icon: Icon }) => (
          <Link key={title} to={to} className={`dashboard-link ${accent}`}>
            <span className="dashboard-icon">
              <Icon size={20} />
            </span>
            <div>
              <strong>{title}</strong>
              <small>{description}</small>
            </div>
          </Link>
        ))}
      </div>

      <div className="card-grid">
        {cards.map((card) => (
          <div key={card.label} className={`metric-card ${card.accent}`}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </div>
        ))}
      </div>

      <div className="panel">
        <h2>Aktueller Betrieb</h2>
        <div className="stats-list">
          <div>
            <label>Verfügbare Artikel</label>
            <strong>{articles.length}</strong>
          </div>
          <div>
            <label>Verfügbare Toppings</label>
            <strong>{toppings.length}</strong>
          </div>
          <div>
            <label>Bestellungen heute</label>
            <strong>{orders.length}</strong>
          </div>
          <div>
            <label>Ausgaben gesamt</label>
            <strong>{formatMoney(totalExpenses)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArticlesPage({ articles, setArticles, toppings, setToppings }) {
  const [articleName, setArticleName] = useState('');
  const [articlePrice, setArticlePrice] = useState('');
  const [articleCost, setArticleCost] = useState('');
  const [articleCategory, setArticleCategory] = useState('Süß');
  const [articleStock, setArticleStock] = useState('');

  const [toppingName, setToppingName] = useState('');
  const [toppingPrice, setToppingPrice] = useState('');

  const addArticle = (event) => {
    event.preventDefault();
    const name = articleName.trim();
    if (!name) {
      return;
    }

    setArticles((current) => [
      ...current,
      {
        id: `art-${Date.now()}`,
        name,
        category: articleCategory,
        price: Number(articlePrice || 0),
        costPrice: Number(articleCost || 0),
        stock: Number(articleStock || 0),
      },
    ]);

    setArticleName('');
    setArticlePrice('');
    setArticleCost('');
    setArticleCategory('Süß');
    setArticleStock('');
  };

  const removeArticle = (id) => {
    setArticles((current) => current.filter((item) => item.id !== id));
  };

  const addTopping = (event) => {
    event.preventDefault();
    const name = toppingName.trim();
    if (!name) {
      return;
    }

    setToppings((current) => [
      ...current,
      {
        id: `top-${Date.now()}`,
        name,
        price: Number(toppingPrice || 0),
      },
    ]);

    setToppingName('');
    setToppingPrice('');
  };

  const removeTopping = (id) => {
    setToppings((current) => current.filter((item) => item.id !== id));
  };

  return (
    <div>
      <PageHeader title="Artikel verwalten" subtitle="Produkte" showBack />

      <div className="two-column">
        <form className="panel" onSubmit={addArticle}>
          <h2>Neuen Artikel anlegen</h2>
          <div className="form-grid">
            <label>
              Name
              <input value={articleName} onChange={(e) => setArticleName(e.target.value)} placeholder="z. B. Crepe" />
            </label>
            <label>
              Kategorie
              <select value={articleCategory} onChange={(e) => setArticleCategory(e.target.value)}>
                <option value="Süß">Süß</option>
                <option value="Getränk">Getränk</option>
                <option value="Herzhaft">Herzhaft</option>
                <option value="Snack">Snack</option>
              </select>
            </label>
            <label>
              Verkaufspreis
              <input type="number" min="0" step="0.1" value={articlePrice} onChange={(e) => setArticlePrice(e.target.value)} placeholder="4.50" />
            </label>
            <label>
              Selbstkosten
              <input type="number" min="0" step="0.1" value={articleCost} onChange={(e) => setArticleCost(e.target.value)} placeholder="1.70" />
            </label>
            <label>
              Lagerbestand
              <input type="number" min="0" value={articleStock} onChange={(e) => setArticleStock(e.target.value)} placeholder="50" />
            </label>
          </div>
          <button className="primary" type="submit">
            <Plus size={16} /> Artikel hinzufügen
          </button>
        </form>

        <form className="panel" onSubmit={addTopping}>
          <h2>Topping anlegen</h2>
          <div className="form-grid">
            <label>
              Name
              <input value={toppingName} onChange={(e) => setToppingName(e.target.value)} placeholder="z. B. Nutella" />
            </label>
            <label>
              Preis
              <input type="number" min="0" step="0.1" value={toppingPrice} onChange={(e) => setToppingPrice(e.target.value)} placeholder="1.20" />
            </label>
          </div>
          <button className="primary" type="submit">
            <Plus size={16} /> Topping hinzufügen
          </button>
        </form>
      </div>

      <div className="two-column list-blocks">
        <div className="panel">
          <h2>Artikel</h2>
          <div className="list">
            {articles.map((article) => (
              <div key={article.id} className="list-item">
                <div>
                  <strong>{article.name}</strong>
                  <span>{article.category}</span>
                </div>
                <div className="list-meta">
                  <span>{article.stock} Stück</span>
                  <span>{formatMoney(article.price)}</span>
                  <span>{formatMoney(article.costPrice || 0)} Kosten</span>
                  <button type="button" className="icon-button" onClick={() => removeArticle(article.id)}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h2>Toppings</h2>
          <div className="list">
            {toppings.map((topping) => (
              <div key={topping.id} className="list-item">
                <div>
                  <strong>{topping.name}</strong>
                </div>
                <div className="list-meta">
                  <span>{formatMoney(topping.price)}</span>
                  <button type="button" className="icon-button" onClick={() => removeTopping(topping.id)}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrdersPage({ articles, toppings, orders, setOrders }) {
  const [orderNumber, setOrderNumber] = useState('');
  const [customer, setCustomer] = useState('');
  const [selectedArticleId, setSelectedArticleId] = useState(articles[0]?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [selectedToppings, setSelectedToppings] = useState([]);

  const article = useMemo(
    () => articles.find((item) => item.id === selectedArticleId) || articles[0],
    [articles, selectedArticleId]
  );

  useEffect(() => {
    if (!selectedArticleId && articles[0]) {
      setSelectedArticleId(articles[0].id);
    }
  }, [articles, selectedArticleId]);

  const toggleTopping = (toppingName) => {
    setSelectedToppings((current) =>
      current.includes(toppingName)
        ? current.filter((item) => item !== toppingName)
        : [...current, toppingName]
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!article) {
      return;
    }

    const numericOrderNumber = orderNumber.trim() || `ORD-${orders.length + 101}`;
    const totalToppingPrice = selectedToppings.reduce((sum, toppingName) => {
      const topping = toppings.find((item) => item.name === toppingName);
      return sum + Number(topping?.price || 0);
    }, 0);

    const orderTotal = (Number(article.price) + totalToppingPrice) * Number(quantity || 1);

    const newOrder = {
      id: numericOrderNumber,
      customer: customer.trim() || 'Unbekannt',
      status: 'offen',
      createdAt: new Date().toISOString(),
      total: Number(orderTotal.toFixed(2)),
      items: [{ articleName: article.name, quantity: Number(quantity || 1), toppings: selectedToppings }],
    };

    setOrders((current) => [newOrder, ...current]);
    setOrderNumber('');
    setCustomer('');
    setSelectedToppings([]);
    setQuantity(1);
    setSelectedArticleId(articles[0]?.id || '');
  };

  return (
    <div>
      <PageHeader title="Bestellung erfassen" subtitle="Auftrag" showBack />
      <form className="panel" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            Bestellnummer
            <input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="ORD-1042" />
          </label>
          <label>
            Kunde
            <input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="z. B. Anna M." />
          </label>
          <label>
            Artikel
            <select value={selectedArticleId} onChange={(e) => setSelectedArticleId(e.target.value)}>
              {articles.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Menge
            <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </label>
        </div>

        <div className="checkbox-group">
          {toppings.map((topping) => (
            <label key={topping.id} className="check-item">
              <input
                type="checkbox"
                checked={selectedToppings.includes(topping.name)}
                onChange={() => toggleTopping(topping.name)}
              />
              <span>
                {topping.name} ({formatMoney(topping.price)})
              </span>
            </label>
          ))}
        </div>

        <div className="summary-box">
          <strong>Gesamtpreis:</strong>{' '}
          {formatMoney(
            ((Number(article?.price || 0) +
              selectedToppings.reduce((sum, toppingName) => {
                const topping = toppings.find((item) => item.name === toppingName);
                return sum + Number(topping?.price || 0);
              }, 0)) *
              Number(quantity || 1))
          )}
        </div>

        <button className="primary" type="submit">
          <ShoppingCart size={16} /> Bestellung aufnehmen
        </button>
      </form>
    </div>
  );
}

function OpenOrdersPage({ orders, setOrders }) {
  const openOrders = orders.filter((order) => order.status === 'offen');

  const completeOrder = (id) => {
    setOrders((current) =>
      current.map((order) =>
        order.id === id ? { ...order, status: 'erledigt' } : order
      )
    );
  };

  return (
    <div>
      <PageHeader title="Offene Aufträge" subtitle="Warteschlange" showBack />
      <div className="panel">
        {openOrders.length === 0 ? (
          <p className="empty-state">Keine offenen Aufträge vorhanden.</p>
        ) : (
          <div className="queue-list">
            {openOrders.map((order) => (
              <div key={order.id} className="queue-item">
                <div className="queue-head">
                  <div>
                    <span className="order-number">{order.id}</span>
                    <strong>{order.customer}</strong>
                  </div>
                  <span className="price">{formatMoney(order.total)}</span>
                </div>

                <div className="queue-details">
                  {order.items.map((item, index) => (
                    <div key={`${order.id}-${index}`}>
                      {item.quantity}x {item.articleName}
                      {item.toppings.length > 0 && <span> • {item.toppings.join(', ')}</span>}
                    </div>
                  ))}
                </div>

                <button type="button" className="primary small" onClick={() => completeOrder(order.id)}>
                  <CheckCircle2 size={15} /> Als erledigt markieren
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ExpensesPage({ expenses, setExpenses }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Material');
  const [amount, setAmount] = useState('');
  const [occurredOn, setOccurredOn] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');

  const categoryOptions = [
    'Material',
    'Personal',
    'Betriebskosten',
    'Verpackung',
    'Marketing',
    'Sonstiges',
  ];

  const categoryTotals = useMemo(() => {
    const totals = {};

    expenses.forEach((expense) => {
      const key = expense.category || 'Sonstiges';
      totals[key] = (totals[key] || 0) + Number(expense.amount || 0);
    });

    return Object.entries(totals).map(([name, total]) => ({ name, total }));
  }, [expenses]);

  const addExpense = (event) => {
    event.preventDefault();
    const nextTitle = title.trim();
    if (!nextTitle || !amount) {
      return;
    }

    setExpenses((current) => [
      {
        id: `exp-${Date.now()}`,
        title: nextTitle,
        category: category.trim() || 'Sonstiges',
        amount: Number(amount),
        occurredOn,
        note: note.trim(),
      },
      ...current,
    ]);

    setTitle('');
    setCategory('Material');
    setAmount('');
    setNote('');
    setOccurredOn(new Date().toISOString().slice(0, 10));
  };

  const removeExpense = (id) => {
    setExpenses((current) => current.filter((expense) => expense.id !== id));
  };

  return (
    <div>
      <PageHeader title="Ausgaben" subtitle="Kostenverwaltung" showBack />

      <div className="two-column">
        <form className="panel" onSubmit={addExpense}>
          <h2>Neue Ausgabe erfassen</h2>
          <div className="form-grid">
            <label>
              Bezeichnung
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="z. B. Mehl" />
            </label>
            <label>
              Kategorie
              <input
                list="expense-category-options"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Material"
              />
            </label>
            <label>
              Betrag
              <input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="120" />
            </label>
            <label>
              Datum
              <input type="date" value={occurredOn} onChange={(e) => setOccurredOn(e.target.value)} />
            </label>
          </div>

          <label>
            Notiz
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="z. B. Lieferkosten für Zutaten" />
          </label>

          <datalist id="expense-category-options">
            {categoryOptions.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>

          <button className="primary" type="submit">
            <Plus size={16} /> Ausgabe speichern
          </button>
        </form>

        <div className="panel">
          <h2>Ausgaben nach Kategorie</h2>
          {categoryTotals.length === 0 ? (
            <p className="empty-state">Noch keine Ausgaben erfasst.</p>
          ) : (
            <div className="category-list">
              {categoryTotals.map(({ name, total }) => (
                <div key={name} className="list-item compact">
                  <strong>{name}</strong>
                  <span>{formatMoney(total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="panel">
        <h2>Erfasste Ausgaben</h2>
        {expenses.length === 0 ? (
          <p className="empty-state">Keine Ausgaben vorhanden.</p>
        ) : (
          <div className="list">
            {expenses.map((expense) => (
              <div key={expense.id} className="list-item">
                <div>
                  <strong>{expense.title}</strong>
                  <span>
                    {expense.category} • {new Date(expense.occurredOn).toLocaleDateString('de-DE')}
                  </span>
                  {expense.note ? <small>{expense.note}</small> : null}
                </div>
                <div className="list-meta">
                  <span>{formatMoney(expense.amount)}</span>
                  <button type="button" className="icon-button" onClick={() => removeExpense(expense.id)}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FinancePage({ articles, toppings, orders, expenses }) {
  const toppingLookup = useMemo(
    () => new Map(toppings.map((topping) => [topping.name.toLowerCase(), topping])),
    [toppings]
  );

  const itemPerformance = useMemo(() => {
    const metrics = new Map();

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const article = articles.find((entry) => entry.name === item.articleName) || null;
        const quantity = Number(item.quantity || 0);
        const toppingRevenue = (item.toppings || []).reduce((sum, toppingName) => {
          const topping = toppingLookup.get(String(toppingName).toLowerCase());
          return sum + Number(topping?.price || 0);
        }, 0);
        const sellingPrice = Number(article?.price || 0) + toppingRevenue;
        const costPrice = Number(article?.costPrice || 0);

        const row = metrics.get(item.articleName) || {
          name: item.articleName,
          sold: 0,
          revenue: 0,
          cost: 0,
        };

        row.sold += quantity;
        row.revenue += sellingPrice * quantity;
        row.cost += costPrice * quantity;
        metrics.set(item.articleName, row);
      });
    });

    return [...metrics.values()]
      .map((entry) => ({
        ...entry,
        profit: entry.revenue - entry.cost,
        margin: entry.revenue ? ((entry.revenue - entry.cost) / entry.revenue) * 100 : 0,
      }))
      .sort((a, b) => b.profit - a.profit);
  }, [articles, orders, toppingLookup]);

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const totalCost = itemPerformance.reduce((sum, item) => sum + Number(item.cost || 0), 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const grossProfit = totalRevenue - totalCost;
  const netProfit = grossProfit - totalExpenses;
  const netMargin = totalRevenue ? (netProfit / totalRevenue) * 100 : 0;

  const expenseByCategory = useMemo(() => {
    const totals = {};
    expenses.forEach((expense) => {
      const key = expense.category || 'Sonstiges';
      totals[key] = (totals[key] || 0) + Number(expense.amount || 0);
    });
    return Object.entries(totals).map(([label, value]) => ({ label, value }));
  }, [expenses]);

  return (
    <div>
      <PageHeader title="Finanzen" subtitle="Wirtschaftlichkeit" showBack />

      <div className="summary-grid">
        <div className="metric-card blue">
          <span>Gesamtumsatz</span>
          <strong>{formatMoney(totalRevenue)}</strong>
        </div>
        <div className="metric-card blue">
          <span>Wareneinsatz</span>
          <strong>{formatMoney(totalCost)}</strong>
        </div>
        <div className="metric-card green">
          <span>Bruttogewinn</span>
          <strong>{formatMoney(grossProfit)}</strong>
        </div>
        <div className="metric-card orange">
          <span>Ausgaben</span>
          <strong>{formatMoney(totalExpenses)}</strong>
        </div>
        <div className="metric-card blue">
          <span>Nettoergebnis</span>
          <strong>{formatMoney(netProfit)}</strong>
        </div>
        <div className="metric-card green">
          <span>Netto-Marge</span>
          <strong>{netMargin.toFixed(1)}%</strong>
        </div>
      </div>

      <div className="two-column">
        <div className="panel">
          <h2>Ausgaben pro Kategorie</h2>
          {expenseByCategory.length === 0 ? (
            <p className="empty-state">Noch keine Ausgaben erfasst.</p>
          ) : (
            <div className="category-list">
              {expenseByCategory.map(({ label, value }) => (
                <div key={label} className="list-item compact">
                  <strong>{label}</strong>
                  <span>{formatMoney(value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <h2>Artikelwirtschaftlichkeit</h2>
          {itemPerformance.length === 0 ? (
            <p className="empty-state">Noch keine Verkäufe erfasst.</p>
          ) : (
            <div className="finance-table">
              <div className="finance-row finance-header">
                <span>Artikel</span>
                <span>Verk.</span>
                <span>Umsatz</span>
                <span>Kosten</span>
                <span>Gewinn</span>
              </div>
              {itemPerformance.map((item) => (
                <div key={item.name} className="finance-row">
                  <span>{item.name}</span>
                  <span>{item.sold}</span>
                  <span>{formatMoney(item.revenue)}</span>
                  <span>{formatMoney(item.cost)}</span>
                  <span className={item.profit >= 0 ? 'profit-positive' : 'profit-negative'}>
                    {formatMoney(item.profit)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Layout({ children }) {
  return (
    <div className="app-shell">
      <main className="content">
        <header className="topbar">
          <div className="topbar-left">
            <div className="brand-mark">
              <LayoutGrid size={18} />
            </div>
            <div>
              <span className="eyebrow">Verwaltung</span>
              <h2>ERP Weihnachtsmarkt</h2>
            </div>
          </div>

          <div className="topbar-actions">
            <span className="status-pill">Live</span>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}

export default function App() {
  const [articles, setArticles] = useStoredState(STORAGE_KEY_ARTICLES, defaultArticles);
  const [toppings, setToppings] = useStoredState(STORAGE_KEY_TOPPINGS, defaultToppings);
  const [orders, setOrders] = useStoredState(STORAGE_KEY_ORDERS, defaultOrders);
  const [expenses, setExpenses] = useStoredState(STORAGE_KEY_EXPENSES, defaultExpenses);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage articles={articles} toppings={toppings} orders={orders} expenses={expenses} />} />
        <Route
          path="/artikel"
          element={<ArticlesPage articles={articles} setArticles={setArticles} toppings={toppings} setToppings={setToppings} />}
        />
        <Route
          path="/bestellungen"
          element={<OrdersPage articles={articles} toppings={toppings} orders={orders} setOrders={setOrders} />}
        />
        <Route path="/offene-auftraege" element={<OpenOrdersPage orders={orders} setOrders={setOrders} />} />
        <Route path="/ausgaben" element={<ExpensesPage expenses={expenses} setExpenses={setExpenses} />} />
        <Route path="/finanzen" element={<FinancePage articles={articles} toppings={toppings} orders={orders} expenses={expenses} />} />
      </Routes>
    </Layout>
  );
}
