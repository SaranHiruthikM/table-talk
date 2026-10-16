import { useEffect, useState } from "react";
import {
  Link,
  Route,
  Routes,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowLeft,
  Bookmark,
  ChefHat,
  Clock3,
  Edit3,
  Heart,
  ImagePlus,
  LoaderCircle,
  Plus,
  Search,
  Send,
  Sparkles,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import {
  createRecipe,
  deleteRecipe,
  getRecipe,
  getRecipes,
  toggleLike,
  toggleSave,
  updateRecipe,
} from "./api";

const demoImages = [
  "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80",
];
const CURRENT_USER = "you";

function Header() {
  return (
    <header className="topbar">
      <Link to="/" className="brand">
        <span className="brand-mark">
          <ChefHat size={19} />
        </span>
        <span>
          Table<span className="brand-accent">Talk</span>
        </span>
      </Link>
      <nav>
        <Link to="/">Recipes</Link>
        <Link to="/new" className="publish-link">
          <Plus size={16} /> Add a recipe
        </Link>
      </nav>
    </header>
  );
}

function RecipeCard({ recipe, onUpdate }) {
  const [busy, setBusy] = useState(false);
  const [local, setLocal] = useState(recipe);
  const change = async (action) => {
    setBusy(true);
    try {
      const next = await action(local._id, CURRENT_USER);
      setLocal(next);
      onUpdate?.(next);
    } catch (error) {
      window.alert(error.message);
    } finally {
      setBusy(false);
    }
  };
  const liked = local.likedBy?.includes(CURRENT_USER);
  const saved = local.savedBy?.includes(CURRENT_USER);
  return (
    <article className="recipe-card">
      <Link to={`/recipes/${local._id}`} className="card-image-wrap">
        <img src={local.imageUrl} alt={local.title} className="card-image" />
        <span className="time-chip">
          <Clock3 size={13} /> {local.cookingTime} min
        </span>
      </Link>
      <div className="card-body">
        <div className="eyebrow">
          {local.author} <span>·</span> {local.ingredients.length} ingredients
        </div>
        <Link to={`/recipes/${local._id}`} className="card-title">
          {local.title}
        </Link>
        <div className="card-actions">
          <button
            className={liked ? "icon-button active" : "icon-button"}
            onClick={() => change(toggleLike)}
            disabled={busy}
            aria-label="Like recipe"
          >
            <Heart size={18} fill={liked ? "currentColor" : "none"} />
            <span>{local.likes}</span>
          </button>
          <button
            className={saved ? "icon-button active save" : "icon-button"}
            onClick={() => change(toggleSave)}
            disabled={busy}
            aria-label="Save recipe"
          >
            <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
          </button>
          <Link to={`/recipes/${local._id}`} className="view-link">
            View recipe <ArrowLeft size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
}

function Discover() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("search") || "");
  const [data, setData] = useState({ recipes: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = async (term = search, page = 1) => {
    setLoading(true);
    setError("");
    try {
      setData(await getRecipes(term, page));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load(params.get("search") || "");
  }, [params]);
  const submit = (event) => {
    event.preventDefault();
    setParams(search ? { search } : {});
  };
  return (
    <>
      <Header />
      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="kicker">
              <Sparkles size={15} /> From our kitchens
            </p>
            <h1>
              Recipes you’ll
              <br />
              <em>make again.</em>
            </h1>
            <p className="hero-note">
              A small collection of recipes people actually cook: weeknight
              staples, family favourites, and the occasional project.
            </p>
            <form className="search-bar" onSubmit={submit}>
              <Search size={20} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Try “tomato”, “noodles”, or a name"
              />
              <button type="submit">Search</button>
            </form>
          </div>
          <div className="hero-art">
            <div className="art-ring ring-one" />
            <div className="art-ring ring-two" />
            <img src={demoImages[0]} alt="Colorful bowl of fresh ingredients" />
            <div className="art-note">
              <UtensilsCrossed size={16} />
              <span>Notes from real kitchens</span>
            </div>
          </div>
        </section>
        <section className="content-section">
          <div className="section-heading">
            <div>
              <p className="kicker">On the counter</p>
              <h2>{search ? `Recipes for “${search}”` : "Latest recipes"}</h2>
            </div>
            <span className="result-count">
              {data.pagination.total || 0} recipes
            </span>
          </div>
          {loading ? (
            <div className="status">
              <LoaderCircle className="spin" /> Loading recipes...
            </div>
          ) : error ? (
            <div className="status error">
              {error}
              <button onClick={() => load()}>Try again</button>
            </div>
          ) : data.recipes.length ? (
            <>
              <div className="recipe-grid">
                {data.recipes.map((recipe) => (
                  <RecipeCard key={recipe._id} recipe={recipe} />
                ))}
              </div>
              {data.pagination.pages > 1 && (
                <div className="pagination">
                  {Array.from({ length: data.pagination.pages }, (_, index) => (
                    <button
                      key={index}
                      onClick={() => load(search, index + 1)}
                      className={
                        data.pagination.page === index + 1 ? "current" : ""
                      }
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <ChefHat size={32} />
              <h3>The counter is clear</h3>
              <p>Add the first recipe to this collection.</p>
              <Link className="button primary" to="/new">
                Add a recipe
              </Link>
            </div>
          )}
        </section>
      </main>
    </>
  );
}

function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    getRecipe(id)
      .then(setRecipe)
      .catch((err) => setError(err.message));
  }, [id]);
  if (error)
    return (
      <>
        <Header />
        <div className="status error">{error}</div>
      </>
    );
  if (!recipe)
    return (
      <>
        <Header />
        <div className="status">
          <LoaderCircle className="spin" /> Loading recipe...
        </div>
      </>
    );
  const interact = async (action) => {
    try {
      setRecipe(await action(recipe._id, CURRENT_USER));
    } catch (err) {
      setError(err.message);
    }
  };
  const remove = async () => {
    if (!window.confirm(`Delete “${recipe.title}”? This cannot be undone.`))
      return;
    setDeleting(true);
    try {
      await deleteRecipe(recipe._id);
      navigate("/");
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  };
  const liked = recipe.likedBy?.includes(CURRENT_USER);
  const saved = recipe.savedBy?.includes(CURRENT_USER);
  return (
    <>
      <Header />
      <main className="detail-page">
        <Link to="/" className="back-link">
          <ArrowLeft size={16} /> Back to recipes
        </Link>
        <div className="detail-grid">
          <img
            className="detail-image"
            src={recipe.imageUrl}
            alt={recipe.title}
          />
          <div className="detail-copy">
            <p className="kicker">Recipe by {recipe.author}</p>
            <h1>{recipe.title}</h1>
            <p className="detail-intro">
              The kind of recipe that earns a spot in your regular rotation.
            </p>
            <div className="detail-meta">
              <span>
                <Clock3 size={18} /> {recipe.cookingTime} minutes
              </span>
              <span>
                <UtensilsCrossed size={18} /> {recipe.ingredients.length}{" "}
                ingredients
              </span>
            </div>
            <div className="detail-buttons">
              <button
                onClick={() => interact(toggleLike)}
                className={liked ? "button primary" : "button outline"}
              >
                <Heart size={17} fill={liked ? "currentColor" : "none"} />{" "}
                {liked ? "Liked" : "Like"} · {recipe.likes}
              </button>
              <button
                onClick={() => interact(toggleSave)}
                className={saved ? "button dark" : "button outline"}
              >
                <Bookmark size={17} fill={saved ? "currentColor" : "none"} />{" "}
                {saved ? "Saved" : "Save recipe"}
              </button>
              <Link
                to={`/recipes/${recipe._id}/edit`}
                className="button outline"
              >
                <Edit3 size={17} /> Edit
              </Link>
              <button
                onClick={remove}
                disabled={deleting}
                className="button danger"
              >
                <Trash2 size={17} /> {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
        <div className="instructions">
          <section>
            <p className="kicker">What you’ll need</p>
            <h2>Ingredients</h2>
            <ul className="ingredient-list">
              {recipe.ingredients.map((item, i) => (
                <li key={i}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <p className="kicker">How to make it</p>
            <h2>Method</h2>
            <ol className="steps-list">
              {recipe.steps.map((step, i) => (
                <li key={i}>
                  <span>{i + 1}</span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </main>
    </>
  );
}

function RecipeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const [form, setForm] = useState({
    title: "",
    author: "",
    cookingTime: 30,
    imageUrl: "",
    ingredients: ["", ""],
    steps: ["", ""],
  });
  const [imageFile, setImageFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (editing)
      getRecipe(id)
        .then((recipe) =>
          setForm({
            ...recipe,
            ingredients: recipe.ingredients.join("\n"),
            steps: recipe.steps.join("\n"),
          }),
        )
        .catch((err) => setError(err.message));
  }, [editing, id]);
  const set = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const body = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "ingredients" || key === "steps")
        value.split("\n").forEach((item) => body.append(key, item));
      else if (
        ![
          "_id",
          "likes",
          "likedBy",
          "savedBy",
          "createdAt",
          "updatedAt",
        ].includes(key)
      )
        body.append(key, value);
    });
    if (imageFile) body.append("image", imageFile);
    try {
      const recipe = editing
        ? await updateRecipe(id, body)
        : await createRecipe(body);
      navigate(`/recipes/${recipe._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <Header />
      <main className="form-page">
        <Link to="/" className="back-link">
          <ArrowLeft size={16} /> Back to recipes
        </Link>
        <div className="form-intro">
          <p className="kicker">
            <ImagePlus size={15} /> Add to the notebook
          </p>
          <h1>
            {editing ? "Tidy up your recipe." : "What have you been cooking?"}
          </h1>
          <p>
            Write it down the way you’d explain it to a friend. One ingredient
            or step per line keeps everything easy to follow.
          </p>
        </div>
        <form className="recipe-form" onSubmit={submit}>
          <div className="field full">
            <label>
              Recipe title
              <input
                required
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Lemon butter pasta"
              />
            </label>
          </div>
          <div className="field">
            <label>
              Your name
              <input
                required
                value={form.author}
                onChange={(e) => set("author", e.target.value)}
                placeholder="e.g. Maya Chen"
              />
            </label>
          </div>
          <div className="field">
            <label>
              Cooking time <span className="suffix">minutes</span>
              <input
                required
                type="number"
                min="1"
                value={form.cookingTime}
                onChange={(e) => set("cookingTime", e.target.value)}
              />
            </label>
          </div>
          <div className="field">
            <label>
              Image URL
              <input
                required={!imageFile}
                value={form.imageUrl}
                onChange={(e) => set("imageUrl", e.target.value)}
                placeholder="https://images.unsplash.com/..."
              />
            </label>
          </div>
          <div className="field">
            <label>
              Upload image <span className="suffix">max 5 MB</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
            </label>
          </div>
          <div className="field">
            <label>
              Ingredients
              <textarea
                required
                value={
                  Array.isArray(form.ingredients)
                    ? form.ingredients.join("\n")
                    : form.ingredients
                }
                onChange={(e) => set("ingredients", e.target.value)}
                placeholder={"2 cups flour\n1 tsp sea salt\n..."}
              />
            </label>
          </div>
          <div className="field">
            <label>
              Method
              <textarea
                required
                value={
                  Array.isArray(form.steps) ? form.steps.join("\n") : form.steps
                }
                onChange={(e) => set("steps", e.target.value)}
                placeholder={"Mix the ingredients...\nBake until golden..."}
              />
            </label>
          </div>
          {error && <div className="form-error">{error}</div>}
          <button
            disabled={busy}
            className="button primary submit-button"
            type="submit"
          >
            {busy ? (
              <>
                <LoaderCircle className="spin" size={17} /> Saving...
              </>
            ) : (
              <>
                <Send size={17} /> {editing ? "Save changes" : "Add recipe"}
              </>
            )}
          </button>
        </form>
      </main>
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Discover />} />
      <Route path="/new" element={<RecipeForm />} />
      <Route path="/recipes/:id" element={<RecipeDetail />} />
      <Route path="/recipes/:id/edit" element={<RecipeForm />} />
    </Routes>
  );
}
