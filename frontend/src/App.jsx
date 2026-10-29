import { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
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
  { id: 'top-1', name: 'Nutella', price: 1.2, articleId: 'art-1', articleName: 'Crepe' },
  { id: 'top-2', name: 'Erdbeeren', price: 1.5, articleId: 'art-2', articleName: 'Waffel' },
  { id: 'top-3', name: 'Krokant', price: 1.1, articleId: 'art-1', articleName: 'Crepe' },
];

const defaultOrders = [
  {
    id: 'ORD-1001',
    customer: 'Anna M.',
    customerNumber: 'K-1001',
    status: 'offen',
    createdAt: '2026-10-21T09:15:00.000Z',
    total: 11.8,
    items: [{ articleName: 'Crepe', quantity: 2, toppings: ['Nutella', 'Krokant'] }],
  },
  {
    id: 'ORD-1002',
    customer: 'Müller',
    customerNumber: 'K-1002',
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

function PageHeader({ title, showBack = false }) {
  return (
    <div className={`page-header${showBack ? ' subpage-header' : ''}`}>
      {showBack ? (
        <Link to="/" className="back-link">
          <ArrowLeft size={18} /> Zurück
        </Link>
      ) : null}
      <div>
        <h1>{title}</h1>
      </div>
    </div>
  );
}

function DashboardPage({ articles, orders, expenses }) {
  const openOrders = orders.filter(
    (order) =>
      order.status === 'offen' &&
      order.items?.some((item) => item.showInOpenOrders !== false && !item.done)
  );

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

  return (
    <div>
      <PageHeader title="Dashboard" />

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
    </div>
  );
}

function ArticlesPage({ articles, setArticles, toppings, setToppings }) {
  const [articleName, setArticleName] = useState('');
  const [articlePrice, setArticlePrice] = useState('');
  const [showInOpenOrders, setShowInOpenOrders] = useState(true);

  const [toppingName, setToppingName] = useState('');
  const [toppingPrice, setToppingPrice] = useState('');
  const [selectedToppingArticleId, setSelectedToppingArticleId] = useState(articles[0]?.id || '');

  useEffect(() => {
    if (!selectedToppingArticleId && articles[0]) {
      setSelectedToppingArticleId(articles[0].id);
    }
  }, [articles, selectedToppingArticleId]);

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
        price: Number(articlePrice || 0),
        showInOpenOrders,
      },
    ]);

    setArticleName('');
    setArticlePrice('');
    setShowInOpenOrders(true);
  };

  const removeArticle = (id) => {
    setArticles((current) => current.filter((item) => item.id !== id));
  };

  const toggleArticleOpenOrder = (id, value) => {
    setArticles((current) =>
      current.map((item) => (item.id === id ? { ...item, showInOpenOrders: value } : item))
    );
  };

  const addTopping = (event) => {
    event.preventDefault();
    const name = toppingName.trim();
    const article = articles.find((item) => item.id === selectedToppingArticleId);

    if (!name || !article) {
      return;
    }

    setToppings((current) => [
      ...current,
      {
        id: `top-${Date.now()}`,
        name,
        price: Number(toppingPrice || 0),
        articleId: article.id,
        articleName: article.name,
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
      <PageHeader title="Artikel verwalten" showBack />

      <div className="two-column">
        <form className="panel" onSubmit={addArticle}>
          <h2>Neuen Artikel anlegen</h2>
          <div className="form-grid">
            <label>
              Name
              <input value={articleName} onChange={(e) => setArticleName(e.target.value)} placeholder="z. B. Crepe" />
            </label>
            <label>
              Verkaufspreis
              <input type="number" min="0" step="0.1" value={articlePrice} onChange={(e) => setArticlePrice(e.target.value)} placeholder="4.50" />
            </label>
          </div>
          <label className="article-open-order-toggle">
            <input
              type="checkbox"
              checked={showInOpenOrders}
              onChange={(event) => setShowInOpenOrders(event.target.checked)}
            />
            In offenen Aufträgen anzeigen
          </label>
          <button className="primary" type="submit">
            <Plus size={16} /> Artikel hinzufügen
          </button>
        </form>

        <form className="panel" onSubmit={addTopping}>
          <h2>Topping anlegen</h2>
          <div className="form-grid">
            <label>
              Artikel
              <select value={selectedToppingArticleId} onChange={(e) => setSelectedToppingArticleId(e.target.value)}>
                {articles.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
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
                  <label className="article-open-order-toggle">
                    <input
                      type="checkbox"
                      checked={article.showInOpenOrders !== false}
                      onChange={(event) => toggleArticleOpenOrder(article.id, event.target.checked)}
                    />
                    In offenen Aufträgen anzeigen
                  </label>
                </div>
                <div className="list-meta">
                  <span>{formatMoney(article.price)}</span>
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
                  <small>{topping.articleName || 'Allgemein'}</small>
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

function getNextOrderNumber(existingOrders) {
  const maxNumber = existingOrders.reduce((highest, order) => {
    const match = String(order.id || '').match(/(\d+)$/);
    const value = match ? Number(match[1]) : 0;
    return Math.max(highest, value);
  }, 1000);

  return `ORD-${String(maxNumber + 1)}`;
}

function OrdersPage({ articles, toppings, orders, setOrders }) {
  const [customerNumber, setCustomerNumber] = useState('');
  const [positions, setPositions] = useState(() =>
    articles[0] ? [{ id: `pos-${Date.now()}`, articleId: articles[0].id, toppings: [] }] : []
  );
  const [isArticleSelectorOpen, setIsArticleSelectorOpen] = useState(false);
  const [activeArticlePositionId, setActiveArticlePositionId] = useState(null);
  const [isOrderListOpen, setIsOrderListOpen] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [handoverOrderId, setHandoverOrderId] = useState(null);
  const handoverOrder = orders.find((order) => order.id === handoverOrderId) || null;
  const hasPendingHandoverItems = handoverOrder?.items.some(
    (item) => item.showInOpenOrders === false && !item.done
  ) || false;

  useEffect(() => {
    if (handoverOrderId) {
      return;
    }

    const paidOrderWithPendingHandover = orders.find(
      (order) =>
        order.paymentConfirmed &&
        order.items?.some((item) => item.showInOpenOrders === false && !item.done)
    );
    if (paidOrderWithPendingHandover) {
      setHandoverOrderId(paidOrderWithPendingHandover.id);
    }
  }, [orders, handoverOrderId]);

  useEffect(() => {
    if (!positions.length && articles[0]) {
      setPositions([{ id: `pos-${Date.now()}`, articleId: articles[0].id, toppings: [] }]);
    }
  }, [articles, positions.length]);

  const updatePosition = (positionId, updater) => {
    setPositions((current) =>
      current.map((position) => (position.id === positionId ? updater(position) : position))
    );
  };

  const addPosition = () => {
    if (!articles.length) {
      return;
    }

    setPositions((current) => [
      ...current,
      {
        id: `pos-${Date.now()}-${Math.random()}`,
        articleId: articles[0].id,
        toppings: [],
      },
    ]);
  };

  const removePosition = (positionId) => {
    setPositions((current) => current.filter((position) => position.id !== positionId));
  };

  const togglePositionTopping = (positionId, toppingName) => {
    updatePosition(positionId, (position) => ({
      ...position,
      toppings: position.toppings.includes(toppingName)
        ? position.toppings.filter((item) => item !== toppingName)
        : [...position.toppings, toppingName],
    }));
  };

  const positionOrderTotal = (position) => {
    const article = articles.find((item) => item.id === position.articleId);
    if (!article) {
      return 0;
    }

    const toppingPrice = position.toppings.reduce((sum, toppingName) => {
      const topping = toppings.find((item) => item.name === toppingName);
      return sum + Number(topping?.price || 0);
    }, 0);

    return Number(article.price) + toppingPrice;
  };

  const orderTotal = positions.reduce((sum, position) => sum + positionOrderTotal(position), 0);
  const editingOrder = orders.find((order) => order.id === editingOrderId) || null;
  const requiresCustomerNumber = positions.some((position) => {
    const article = articles.find((item) => item.id === position.articleId);
    return article && article.showInOpenOrders !== false;
  });

  const handleSubmit = (event) => {
    event.preventDefault();

    const validPositions = positions.filter((position) => position.articleId);
    if (!validPositions.length || (requiresCustomerNumber && !customerNumber.trim())) {
      return;
    }

    const items = validPositions.map((position) => {
      const article = articles.find((item) => item.id === position.articleId);
      if (!article) {
        return null;
      }

      const articleName = article.name;
      const quantity = 1;
      const toppings = position.toppings;
      const existingItem = editingOrder?.items.find(
        (item) =>
          item.articleName === articleName &&
          Number(item.quantity || 1) === quantity &&
          [...(item.toppings || [])].sort().join('|') === [...toppings].sort().join('|') &&
          (item.showInOpenOrders !== false) === (article.showInOpenOrders !== false)
      );

      return {
        articleName,
        quantity,
        toppings,
        showInOpenOrders: article.showInOpenOrders !== false,
        done: Boolean(existingItem?.done),
      };
    }).filter(Boolean);

    if (editingOrder) {
      const updatedOrder = {
        ...editingOrder,
        customer: customerNumber.trim() || 'K-000',
        customerNumber: customerNumber.trim() || 'K-000',
        status: items.length > 0 && items.every((item) => item.done) ? 'erledigt' : 'offen',
        total: Number(orderTotal.toFixed(2)),
        items,
      };

      setOrders((current) =>
        current.map((order) => (order.id === editingOrder.id ? updatedOrder : order))
      );
      setSaveMessage(`Bestellung ${editingOrder.id} wurde aktualisiert.`);
      setEditingOrderId(null);
      setCustomerNumber('');
      setPositions(articles[0] ? [{ id: `pos-${Date.now()}`, articleId: articles[0].id, toppings: [] }] : []);
      return;
    }

    const newOrder = {
      id: getNextOrderNumber(orders),
      customer: customerNumber.trim() || 'K-000',
      customerNumber: customerNumber.trim() || 'K-000',
      status: 'offen',
      paymentConfirmed: false,
      createdAt: new Date().toISOString(),
      total: Number(orderTotal.toFixed(2)),
      items,
    };

    setOrders((current) => [newOrder, ...current]);
    setReceipt(newOrder);
    setCustomerNumber('');
    setPositions(articles[0] ? [{ id: `pos-${Date.now()}`, articleId: articles[0].id, toppings: [] }] : []);
  };

  const editExistingOrder = (order) => {
    setEditingOrderId(order.id);
    setCustomerNumber(order.customerNumber || '');
    setPositions(order.items.flatMap((item, index) => {
      const article = articles.find((entry) => entry.name === item.articleName) || articles[0];
      return Array.from({ length: Math.max(1, Number(item.quantity || 1)) }, (_, copyIndex) => ({
        id: `edit-${order.id}-${index}-${copyIndex}-${Date.now()}`,
        articleId: article?.id || '',
        toppings: item.toppings || [],
      }));
    }));
    setIsOrderListOpen(false);
    setSaveMessage('');
  };

  const cancelOrderEdit = () => {
    setEditingOrderId(null);
    setCustomerNumber('');
    setPositions(articles[0] ? [{ id: `pos-${Date.now()}`, articleId: articles[0].id, toppings: [] }] : []);
  };

  const confirmPayment = () => {
    const paidOrder = {
      ...receipt,
      paymentConfirmed: true,
    };
    setOrders((current) =>
      current.map((order) => (order.id === receipt.id ? paidOrder : order))
    );
    setReceipt(null);

    if (paidOrder.items.some((item) => item.showInOpenOrders === false && !item.done)) {
      setHandoverOrderId(paidOrder.id);
    }
  };

  const completeImmediateItem = (itemIndex) => {
    if (!handoverOrder) {
      return;
    }

    const updatedItems = handoverOrder.items.map((item, index) =>
      index === itemIndex ? { ...item, done: true } : item
    );
    const allItemsDone = updatedItems.every((item) => Boolean(item.done));

    setOrders((current) =>
      current.map((order) => {
        if (order.id !== handoverOrder.id) {
          return order;
        }

        return {
          ...order,
          items: order.items.map((item, index) =>
            index === itemIndex ? { ...item, done: true } : item
          ),
          status: updatedItems.every((item) => Boolean(item.done)) ? 'erledigt' : 'offen',
        };
      })
    );

    if (allItemsDone) {
      setHandoverOrderId(null);
    }
  };

  return (
    <div>
      <PageHeader title="Bestellung erfassen" showBack />
      <div className="order-management-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setIsOrderListOpen((isOpen) => !isOpen);
            setSaveMessage('');
          }}
        >
          <ClipboardList size={16} />
          {isOrderListOpen ? 'Bestellungen schließen' : 'Vorhandene Bestellungen bearbeiten'}
        </button>
      </div>

      {isOrderListOpen ? (
        <div className="panel existing-orders-panel">
          <div className="open-orders-section-heading">
            <div>
              <h2>Vorhandene Bestellungen</h2>
              <p>Bestellung auswählen, um Kundennummer oder Positionen zu korrigieren.</p>
            </div>
            <span className="open-orders-count">{orders.length} gesamt</span>
          </div>
          {orders.length ? (
            <div className="list">
              {[...orders].map((order) => (
                <button
                  type="button"
                  key={order.id}
                  className="existing-order-row"
                  onClick={() => editExistingOrder(order)}
                >
                  <span>
                    <strong>{order.customerNumber || 'Keine Kundennummer'}</strong>
                    <small>{order.items?.map((item) => `${item.quantity}× ${item.articleName}`).join(', ')}</small>
                  </span>
                  <span className="existing-order-meta">
                    <strong>{formatMoney(order.total)}</strong>
                    <small>{order.status === 'erledigt' ? 'Erledigt' : 'Offen'}</small>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="empty-state">Noch keine Bestellungen vorhanden.</p>
          )}
        </div>
      ) : null}

      {saveMessage ? <p className="order-save-message" role="status">{saveMessage}</p> : null}

      <form className="panel" onSubmit={handleSubmit}>
        {editingOrder ? <h2>Bestellung {editingOrder.id} bearbeiten</h2> : null}
        <div className="form-grid">
          <label>
            Kundennummer{requiresCustomerNumber ? ' *' : ''}
            <input
              value={customerNumber}
              onChange={(e) => setCustomerNumber(e.target.value)}
              placeholder="z. B. K-1042"
              required={requiresCustomerNumber}
              aria-required={requiresCustomerNumber}
            />
            {requiresCustomerNumber ? <small>Pflichtfeld für Artikel in offenen Aufträgen</small> : null}
          </label>
        </div>

        <div className="position-list">
          {positions.map((position) => {
            const positionArticle = articles.find((item) => item.id === position.articleId) || articles[0];
            const positionToppings = toppings.filter((topping) => {
              if (!topping.articleId) {
                return true;
              }
              return topping.articleId === position.articleId;
            });

            return (
              <div key={position.id} className="position-card">
                <div className="position-head">
                  <div className="field-group position-article-field">
                    <span>Artikel</span>
                    <button
                      type="button"
                      className="article-picker-button"
                      onClick={() => {
                        setActiveArticlePositionId(position.id);
                        setIsArticleSelectorOpen(true);
                      }}
                    >
                      {positionArticle ? positionArticle.name : 'Artikel auswählen'}
                    </button>
                  </div>

                  {positions.length > 1 ? (
                    <button type="button" className="icon-button danger-button" onClick={() => removePosition(position.id)}>
                      <Trash2 size={15} />
                    </button>
                  ) : null}
                </div>

                <div className="topping-picker">
                  {positionToppings.map((topping) => {
                    const isSelected = position.toppings.includes(topping.name);
                    return (
                      <button
                        key={topping.id}
                        type="button"
                        className={`topping-chip ${isSelected ? 'selected' : ''}`}
                        onClick={() => togglePositionTopping(position.id, topping.name)}
                      >
                        {topping.name}
                      </button>
                    );
                  })}
                </div>

                <div className="position-total">
                  <strong>Position:</strong> {formatMoney(positionOrderTotal(position))}
                </div>
              </div>
            );
          })}
        </div>

        <button type="button" className="secondary-button" onClick={addPosition}>
          <Plus size={16} /> Position hinzufügen
        </button>

        {isArticleSelectorOpen ? (
          <div className="article-picker-overlay" onClick={() => setIsArticleSelectorOpen(false)}>
            <div className="article-picker-modal" onClick={(event) => event.stopPropagation()}>
              <div className="article-picker-header">
                <h3>Artikel wählen</h3>
                <button type="button" className="icon-button" onClick={() => setIsArticleSelectorOpen(false)}>
                  ×
                </button>
              </div>

              <div className="article-picker-grid">
                {articles.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`article-option ${positions.find((position) => position.id === activeArticlePositionId)?.articleId === item.id ? 'selected' : ''}`}
                    onClick={() => {
                      if (activeArticlePositionId) {
                        updatePosition(activeArticlePositionId, (current) => ({
                          ...current,
                          articleId: item.id,
                          toppings: [],
                        }));
                      }
                      setActiveArticlePositionId(null);
                      setIsArticleSelectorOpen(false);
                    }}
                  >
                    <strong>{item.name}</strong>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <div className="summary-box">
          <strong>Gesamtpreis:</strong> {formatMoney(orderTotal)}
        </div>

        <button className="primary" type="submit">
          <ShoppingCart size={16} /> {editingOrder ? 'Änderungen speichern' : 'Bestellung aufnehmen'}
        </button>
        {editingOrder ? (
          <button type="button" className="secondary-button order-edit-cancel" onClick={cancelOrderEdit}>
            Bearbeitung abbrechen
          </button>
        ) : null}
      </form>

      {receipt ? (
        <div className="receipt-overlay" onClick={() => setReceipt(null)}>
          <div className="receipt-panel" onClick={(event) => event.stopPropagation()}>
            <div className="receipt-header">
              <div>
                <span className="receipt-label">Abrechnung</span>
                <h3>{receipt.id}</h3>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setReceipt(null)}
                aria-label="Abrechnung schließen"
              >
                ×
              </button>
            </div>

            <div className="receipt-list">
              {receipt.items.map((item, index) => {
                const basePrice = articles.find((entry) => entry.name === item.articleName)?.price || 0;
                const toppingTotal = (item.toppings || []).reduce((sum, toppingName) => {
                  const topping = toppings.find((entry) => entry.name === toppingName);
                  return sum + Number(topping?.price || 0);
                }, 0);

                return (
                  <div key={`${receipt.id}-${index}`} className="receipt-item">
                    <div className="receipt-item-main">
                      <strong>{item.quantity}x {item.articleName}</strong>
                      {item.toppings.length > 0 ? <small>{item.toppings.join(', ')}</small> : <small>ohne Extras</small>}
                    </div>
                    <span>{formatMoney((basePrice + toppingTotal) * Number(item.quantity || 1))}</span>
                  </div>
                );
              })}
            </div>

            <div className="receipt-total">
              <span>Gesamt</span>
              <strong>{formatMoney(receipt.total)}</strong>
            </div>

            <div className="receipt-actions">
              <button type="button" className="primary" onClick={confirmPayment}>
                bezahlt
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {handoverOrder ? (
        <div
          className="receipt-overlay"
          onClick={() => !hasPendingHandoverItems && setHandoverOrderId(null)}
        >
          <div className="receipt-panel handover-panel" onClick={(event) => event.stopPropagation()}>
            <div className="receipt-header">
              <div>
                <span className="receipt-label">Zahlung bestätigt</span>
                <h3>Direkt mitgegeben</h3>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setHandoverOrderId(null)}
                disabled={hasPendingHandoverItems}
                aria-label="Übersicht schließen"
              >
                ×
              </button>
            </div>

            <div className="immediate-items">
              {handoverOrder.items.map((item, index) =>
                item.showInOpenOrders === false ? (
                  <div key={`${handoverOrder.id}-immediate-${index}`} className={`immediate-item ${item.done ? 'done' : ''}`}>
                    <div>
                      <strong>{item.quantity}× {item.articleName}</strong>
                      {item.toppings?.length ? <small>{item.toppings.join(', ')}</small> : null}
                    </div>
                    <button
                      type="button"
                      className={item.done ? 'immediate-done-button' : 'primary small'}
                      onClick={() => completeImmediateItem(index)}
                      disabled={item.done}
                    >
                      {item.done ? 'Erledigt' : 'Als erledigt markieren'}
                    </button>
                  </div>
                ) : null
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function OpenOrdersPage({ orders, setOrders }) {
  const openOrders = orders.filter(
    (order) =>
      order.status === 'offen' &&
      order.items?.some((item) => item.showInOpenOrders !== false && !item.done)
  );
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);
  const [pendingItemAction, setPendingItemAction] = useState(null);

  const selectedOrder = orders.find((order) => order.id === selectedOrderId) || null;

  const toggleItemDone = (orderId, itemIndex) => {
    const targetOrder = orders.find((order) => order.id === orderId);
    const targetItem = targetOrder?.items?.[itemIndex];
    if (!targetOrder || !targetItem) {
      return;
    }

    setPendingItemAction({
      orderId,
      itemIndex,
      nextDone: !Boolean(targetItem.done),
    });
  };

  const confirmItemToggle = () => {
    if (!pendingItemAction) {
      return;
    }

    const { orderId, itemIndex, nextDone } = pendingItemAction;

    setOrders((current) =>
      current.map((order) => {
        if (order.id !== orderId) {
          return order;
        }

        const updatedItems = order.items.map((item, index) => {
          if (index !== itemIndex) {
            return item;
          }

          return { ...item, done: nextDone };
        });

        const allDone = updatedItems.length > 0 && updatedItems.every((item) => Boolean(item.done));

        return {
          ...order,
          items: updatedItems,
          status: allDone ? 'erledigt' : 'offen',
        };
      })
    );

    setPendingItemAction(null);
  };

  const completeOrder = (id) => {
    setOrders((current) =>
      current.map((order) =>
        order.id === id ? { ...order, status: 'erledigt', items: order.items.map((item) => ({ ...item, done: true })) } : order
      )
    );
    setSelectedOrderId(null);
    setPendingConfirmation(false);
  };

  return (
    <div className="open-orders-page">
      <PageHeader title="Offene Aufträge" showBack />
      <div className="panel open-orders-panel">
        <div className="open-orders-section-heading">
          <div>
            <h2>Auftragsübersicht</h2>
            <p>Auftrag auswählen, um Positionen abzuhaken.</p>
          </div>
          <span className="open-orders-count">{openOrders.length} offen</span>
        </div>
        {openOrders.length === 0 ? (
          <div className="open-orders-empty">
            <span><CheckCircle2 size={24} /></span>
            <strong>Alles erledigt</strong>
            <p>Im Moment gibt es keine offenen Aufträge.</p>
          </div>
        ) : (
          <div className="queue-list">
            {openOrders.map((order) => (
              <button
                key={order.id}
                type="button"
                className="queue-item order-select-button"
                onClick={() => {
                  setSelectedOrderId(order.id);
                  setPendingConfirmation(false);
                }}
                aria-label={`Auftrag für Kundennummer ${order.customerNumber || 'nicht angegeben'} öffnen`}
              >
                <span className="queue-identifier">
                  <small>Kundennummer</small>
                  <strong>{order.customerNumber || '—'}</strong>
                </span>
                <span className="queue-order-summary">
                  <small>Bestellt</small>
                  {(order.items || [])
                    .filter((item) => item.showInOpenOrders !== false)
                    .map((item, index) => (
                    <span key={`${order.id}-${index}`} className="queue-order-item">
                      <strong>{item.quantity}× {item.articleName}</strong>
                      {item.toppings?.length ? <small>{item.toppings.join(', ')}</small> : null}
                    </span>
                    ))}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedOrder ? (
        <div className="receipt-overlay" onClick={() => setSelectedOrderId(null)}>
          <div className="order-detail-panel" onClick={(event) => event.stopPropagation()}>
            <div className="receipt-header">
              <div>
                <h3>Bestelldetails</h3>
              </div>
              <button type="button" className="icon-button" onClick={() => setSelectedOrderId(null)}>
                ×
              </button>
            </div>

            <div className="order-detail-meta">
              <span className="order-customer-number">
                <small>Kundennummer</small>
                <strong>{selectedOrder.customerNumber || '—'}</strong>
              </span>
            </div>

            <div className="order-item-list">
              {selectedOrder.items.map((item, index) => ({ item, index }))
                .filter(({ item }) => item.showInOpenOrders !== false)
                .map(({ item, index }) => {
                const isDone = Boolean(item.done);

                return (
                  <button
                    key={`${selectedOrder.id}-${index}`}
                    type="button"
                    className={`order-item-toggle ${isDone ? 'done' : ''}`}
                    onClick={() => toggleItemDone(selectedOrder.id, index)}
                  >
                    <div>
                      <strong>{item.quantity}x {item.articleName}</strong>
                      {item.toppings.length > 0 ? <small>{item.toppings.join(', ')}</small> : <small>ohne Extras</small>}
                    </div>
                    <span>{isDone ? 'erledigt' : 'offen'}</span>
                  </button>
                );
              })}
            </div>

            {pendingItemAction ? (
              <div className="confirm-box">
                <p>
                  {pendingItemAction.nextDone ? 'Position als erledigt markieren?' : 'Position als offen zurücksetzen?'}
                </p>
                <div className="confirm-actions">
                  <button type="button" className="secondary-button" onClick={() => setPendingItemAction(null)}>
                    Abbrechen
                  </button>
                  <button type="button" className="primary" onClick={confirmItemToggle}>
                    {pendingItemAction.nextDone ? 'Ja, erledigt' : 'Ja, zurücksetzen'}
                  </button>
                </div>
              </div>
            ) : pendingConfirmation ? (
              <div className="confirm-box">
                <p>Auftrag wirklich als erledigt markieren?</p>
                <div className="confirm-actions">
                  <button type="button" className="secondary-button" onClick={() => setPendingConfirmation(false)}>
                    Abbrechen
                  </button>
                  <button type="button" className="primary" onClick={() => completeOrder(selectedOrder.id)}>
                    Ja, erledigt
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" className="primary order-complete-button" onClick={() => setPendingConfirmation(true)}>
                <CheckCircle2 size={15} /> Als erledigt markieren
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ExpensesPage({ articles, expenses, setExpenses }) {
  const [title, setTitle] = useState('');
  const [articleId, setArticleId] = useState('');
  const [amount, setAmount] = useState('');
  const [occurredOn, setOccurredOn] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');

  const categoryTotals = useMemo(() => {
    const totals = { 'Wareneinsatz': 0, 'Allgemeine Ausgabe': 0 };

    expenses.forEach((expense) => {
      const key = expense.articleId ? 'Wareneinsatz' : 'Allgemeine Ausgabe';
      totals[key] = (totals[key] || 0) + Number(expense.amount || 0);
    });

    return Object.entries(totals)
      .filter(([, total]) => total > 0)
      .map(([name, total]) => ({ name, total }));
  }, [expenses]);

  const addExpense = (event) => {
    event.preventDefault();
    const nextTitle = title.trim();
    if (!nextTitle || !amount) {
      return;
    }

    const assignedArticle = articles.find((article) => article.id === articleId);
    setExpenses((current) => [
      {
        id: `exp-${Date.now()}`,
        title: nextTitle,
        category: assignedArticle ? 'Wareneinsatz' : 'Allgemeine Ausgabe',
        articleId: assignedArticle?.id || '',
        articleName: assignedArticle?.name || '',
        amount: Number(amount),
        occurredOn,
        note: note.trim(),
      },
      ...current,
    ]);

    setTitle('');
    setArticleId('');
    setAmount('');
    setNote('');
    setOccurredOn(new Date().toISOString().slice(0, 10));
  };

  const removeExpense = (id) => {
    setExpenses((current) => current.filter((expense) => expense.id !== id));
  };

  return (
    <div>
      <PageHeader title="Ausgaben" showBack />

      <div className="two-column">
        <form className="panel expenses-form" onSubmit={addExpense}>
          <h2>Neue Ausgabe erfassen</h2>
          <div className="form-grid">
            <label>
              Bezeichnung
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="z. B. Mehl" />
            </label>
            <label>
              Artikel zuordnen (optional)
              <select value={articleId} onChange={(event) => setArticleId(event.target.value)}>
                <option value="">Allgemeine Ausgabe</option>
                {articles.map((article) => (
                  <option key={article.id} value={article.id}>
                    {article.name}
                  </option>
                ))}
              </select>
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

          <button className="primary" type="submit">
            <Plus size={16} /> Ausgabe speichern
          </button>
        </form>

        <div className="panel">
          <h2>Ausgabenübersicht</h2>
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
                  {expense.articleId ? 'Wareneinsatz' : 'Allgemeine Ausgabe'}
                  {expense.articleId && expense.articleName ? ` · ${expense.articleName}` : ''}
                  {' • '}{new Date(expense.occurredOn).toLocaleDateString('de-DE')}
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
      (order.items || []).forEach((item) => {
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

    expenses
      .filter((expense) => expense.articleId)
      .forEach((expense) => {
        const article = articles.find((entry) => entry.id === expense.articleId);
        const name = article?.name || expense.articleName || 'Unbekannter Artikel';
        const row = metrics.get(name) || {
          name,
          sold: 0,
          revenue: 0,
          cost: 0,
        };

        row.cost += Number(expense.amount || 0);
        metrics.set(name, row);
      });

    return [...metrics.values()]
      .map((entry) => ({
        ...entry,
        profit: entry.revenue - entry.cost,
        margin: entry.revenue ? ((entry.revenue - entry.cost) / entry.revenue) * 100 : 0,
      }))
      .sort((a, b) => b.profit - a.profit);
  }, [articles, orders, expenses, toppingLookup]);

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const totalCost = itemPerformance.reduce((sum, item) => sum + Number(item.cost || 0), 0);
  const generalExpenses = expenses
    .filter((expense) => !expense.articleId)
    .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const grossProfit = totalRevenue - totalCost;
  const netProfit = grossProfit - generalExpenses;
  const netMargin = totalRevenue ? (netProfit / totalRevenue) * 100 : 0;
  const revenueOrders = [...orders].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return (Number.isNaN(dateB) ? 0 : dateB) - (Number.isNaN(dateA) ? 0 : dateA);
  });

  return (
    <div>
      <PageHeader title="Finanzen" showBack />

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
          <strong>{formatMoney(generalExpenses)}</strong>
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

      <div className="panel order-revenue-panel">
        <div className="open-orders-section-heading">
          <div>
            <h2>Einnahmen nach Bestellung</h2>
            <p>Einzelübersicht der erfassten Bestellungen.</p>
          </div>
          <span className="open-orders-count">{orders.length} Bestellungen</span>
        </div>
        {revenueOrders.length === 0 ? (
          <p className="empty-state">Noch keine Bestellungen vorhanden.</p>
        ) : (
          <div className="order-revenue-list">
            {revenueOrders.map((order) => {
              const date = order.createdAt ? new Date(order.createdAt) : null;
              const formattedDate =
                date && !Number.isNaN(date.getTime())
                  ? new Intl.DateTimeFormat('de-DE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }).format(date)
                  : 'Datum unbekannt';

              return (
                <div key={order.id} className="order-revenue-row">
                  <div className="order-revenue-details">
                    <div className="order-revenue-heading">
                      <strong>{order.id}</strong>
                      <span>{formatMoney(order.total)}</span>
                    </div>
                    <small>
                      Kundennummer: {order.customerNumber || '—'} <span aria-hidden="true">·</span> {formattedDate}
                    </small>
                    <div className="order-revenue-items">
                      {(order.items || []).map((item, index) => (
                        <span key={`${order.id}-${index}`}>
                          {item.quantity}× {item.articleName}
                          {item.toppings?.length ? ` · ${item.toppings.join(', ')}` : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="two-column">
        <div className="panel">
          <h2>Ausgabenarten</h2>
          {generalExpenses === 0 ? (
            <p className="empty-state">Noch keine allgemeinen Ausgaben erfasst.</p>
          ) : (
            <div className="category-list">
              <div className="list-item compact">
                <strong>Allgemeine Ausgabe</strong>
                <span>{formatMoney(generalExpenses)}</span>
              </div>
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
  const { pathname } = useLocation();

  return (
    <div className="app-shell">
      <main className="content">
        {pathname === '/' ? (
          <header className="topbar">
            <div className="topbar-left">
              <div className="brand-mark">
                <LayoutGrid size={18} />
              </div>
              <h2>ERP Weihnachtsmarkt</h2>
            </div>

            <div className="topbar-actions">
              <span className="status-pill">Live</span>
            </div>
          </header>
        ) : null}

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
        <Route path="/" element={<DashboardPage articles={articles} orders={orders} expenses={expenses} />} />
        <Route
          path="/artikel"
          element={<ArticlesPage articles={articles} setArticles={setArticles} toppings={toppings} setToppings={setToppings} />}
        />
        <Route
          path="/bestellungen"
          element={<OrdersPage articles={articles} toppings={toppings} orders={orders} setOrders={setOrders} />}
        />
        <Route path="/offene-auftraege" element={<OpenOrdersPage orders={orders} setOrders={setOrders} />} />
        <Route path="/ausgaben" element={<ExpensesPage articles={articles} expenses={expenses} setExpenses={setExpenses} />} />
        <Route path="/finanzen" element={<FinancePage articles={articles} toppings={toppings} orders={orders} expenses={expenses} />} />
      </Routes>
    </Layout>
  );
}
