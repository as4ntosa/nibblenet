'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChefHat, Plus, Trash2, Sparkles, Loader2, Check, Leaf, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { PantryItem } from '@/types';
import { generateId } from '@/lib/utils';
import { askAI } from '@/lib/ai';
import { Button } from '@/components/ui/Button';

const PANTRY_KEY = 'nibblen_pantry';

interface Recipe {
  title: string;
  time: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: string[];
  steps: string[];
  usesRescuedFood: boolean;
}

function loadPantry(): PantryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(PANTRY_KEY) || '[]');
  } catch { return []; }
}

function savePantry(items: PantryItem[]) {
  localStorage.setItem(PANTRY_KEY, JSON.stringify(items));
}

export default function PantryPage() {
  const { user } = useAuth();
  const { getConsumerReservations } = useData();
  const [items, setItems] = useState<PantryItem[]>([]);
  const [newItem, setNewItem] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hydrated, setHydrated] = useState(false);

  // Load pantry from localStorage on mount + auto-populate from reservations
  useEffect(() => {
    const stored = loadPantry();
    const reservations = user ? getConsumerReservations(user.id) : [];
    const rescuedItems: PantryItem[] = reservations
      .filter((r) => r.status === 'picked_up')
      .map((r) => ({
        id: `rescue-${r.id}`,
        name: r.listing.title,
        source: 'rescue' as const,
        listingId: r.listingId,
        addedAt: r.createdAt,
        used: false,
      }));

    // Merge: add rescued items not already in stored
    const storedIds = new Set(stored.map((i) => i.id));
    const merged = [
      ...stored,
      ...rescuedItems.filter((r) => !storedIds.has(r.id)),
    ];
    setItems(merged);
    savePantry(merged);
    setHydrated(true);
  }, [user, getConsumerReservations]);

  const activeItems = useMemo(() => items.filter((i) => !i.used), [items]);
  const rescueItems = useMemo(() => activeItems.filter((i) => i.source === 'rescue'), [activeItems]);
  const manualItems = useMemo(() => activeItems.filter((i) => i.source === 'manual'), [activeItems]);

  const addItem = () => {
    const name = newItem.trim();
    if (!name) return;
    const item: PantryItem = {
      id: generateId(),
      name,
      source: 'manual',
      addedAt: new Date().toISOString(),
      used: false,
    };
    const updated = [...items, item];
    setItems(updated);
    savePantry(updated);
    setNewItem('');
  };

  const toggleUsed = (id: string) => {
    const updated = items.map((i) => i.id === id ? { ...i, used: !i.used } : i);
    setItems(updated);
    savePantry(updated);
    setRecipes([]);
  };

  const removeItem = (id: string) => {
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    savePantry(updated);
    setRecipes([]);
  };

  const generateRecipes = async () => {
    if (activeItems.length === 0) return;
    setLoading(true);
    setError('');
    setRecipes([]);
    try {
      const ingredientList = activeItems.map((i) => i.name).join(', ');
      const allergyList = user?.allergies?.join(', ') || 'none';
      const reply = await askAI(
        'You are a creative chef who specializes in reducing food waste. Generate exactly 2 recipes using the provided ingredients. Reply ONLY with a valid JSON array, no markdown, no explanation.',
        `Ingredients available: ${ingredientList}. Dietary restrictions to avoid: ${allergyList}. Format: [{"title":"string","time":"string","difficulty":"Easy|Medium|Hard","ingredients":["string"],"steps":["string (max 5 steps)"],"usesRescuedFood":true}]`,
        600,
      );
      const cleaned = reply.replace(/```json|```/g, '').trim();
      const parsed: Recipe[] = JSON.parse(cleaned);
      setRecipes(parsed);
    } catch {
      setError('Could not generate recipes right now. Try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  if (!hydrated) return null;

  return (
    <div>
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2 mb-0.5">
          <ChefHat size={20} className="text-brand-600" />
          <h1 className="text-xl font-bold text-gray-900">My Pantry</h1>
        </div>
        <p className="text-xs text-gray-400">Track rescued ingredients and generate AI recipes</p>
      </div>

      <div className="px-4 py-4 space-y-5 pb-32">
        {/* Rescued items */}
        {rescueItems.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Leaf size={13} className="text-brand-600" />
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">From Your Rescues</p>
            </div>
            <div className="space-y-2">
              {rescueItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 bg-brand-50 border border-brand-100 rounded-xl px-3 py-2.5">
                  <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                    <span className="text-[10px]">🥡</span>
                  </div>
                  <p className="flex-1 text-sm text-gray-800 font-medium">{item.name}</p>
                  <button
                    onClick={() => toggleUsed(item.id)}
                    className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center hover:bg-brand-200 transition-colors"
                    title="Mark as used"
                  >
                    <Check size={12} className="text-brand-700" />
                  </button>
                  <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-gray-500">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Manual items */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Plus size={13} className="text-gray-500" />
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Also Have at Home</p>
          </div>
          {manualItems.length > 0 && (
            <div className="space-y-2 mb-3">
              {manualItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5">
                  <p className="flex-1 text-sm text-gray-700">{item.name}</p>
                  <button
                    onClick={() => toggleUsed(item.id)}
                    className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                    title="Mark as used"
                  >
                    <Check size={12} className="text-gray-600" />
                  </button>
                  <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-gray-500">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {/* Add item */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItem()}
              placeholder="e.g. eggs, pasta, olive oil…"
              className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand-400 transition-colors"
            />
            <button
              onClick={addItem}
              disabled={!newItem.trim()}
              className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700 disabled:opacity-40 transition-colors shrink-0"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Used items */}
        {items.filter((i) => i.used).length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Used</p>
            <div className="space-y-1.5">
              {items.filter((i) => i.used).map((item) => (
                <div key={item.id} className="flex items-center gap-2 px-3 py-2 opacity-50">
                  <Check size={12} className="text-brand-600" />
                  <p className="text-sm text-gray-400 line-through">{item.name}</p>
                  <button onClick={() => toggleUsed(item.id)} className="text-[10px] text-brand-600 ml-auto">
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {activeItems.length === 0 && (
          <div className="text-center py-10">
            <div className="text-4xl mb-3">🥬</div>
            <p className="text-sm font-semibold text-gray-600 mb-1">Your pantry is empty</p>
            <p className="text-xs text-gray-400">Reserve and pick up food to auto-populate ingredients, or add items manually above.</p>
          </div>
        )}

        {/* Generate recipes button */}
        {activeItems.length > 0 && (
          <Button
            fullWidth
            size="lg"
            onClick={generateRecipes}
            loading={loading}
            className="gap-2"
          >
            {!loading && <Sparkles size={16} />}
            Generate Recipes with AI
          </Button>
        )}

        {/* Error */}
        {error && (
          <p className="text-xs text-red-500 text-center">{error}</p>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            {[0, 1].map((i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-1/3 mb-4" />
                <div className="space-y-2">
                  {[0, 1, 2].map((j) => (
                    <div key={j} className="h-3 bg-gray-100 rounded w-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recipe cards */}
        {recipes.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-amber-500" />
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">AI Generated Recipes</p>
            </div>
            {recipes.map((recipe, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl shadow-card overflow-hidden">
                <div className="bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-white leading-tight">{recipe.title}</h3>
                    {recipe.usesRescuedFood && (
                      <span className="shrink-0 text-[9px] font-bold bg-white/20 text-white px-1.5 py-0.5 rounded-full">
                        🌿 Rescue
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-brand-100">⏱ {recipe.time}</span>
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                      recipe.difficulty === 'Easy' ? 'bg-green-500/30 text-green-100' :
                      recipe.difficulty === 'Medium' ? 'bg-amber-500/30 text-amber-100' :
                      'bg-red-500/30 text-red-100'
                    }`}>{recipe.difficulty}</span>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {recipe.ingredients?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Ingredients</p>
                      <div className="flex flex-wrap gap-1.5">
                        {recipe.ingredients.map((ing, j) => (
                          <span key={j} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{ing}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {recipe.steps?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Steps</p>
                      <ol className="space-y-1.5">
                        {recipe.steps.map((step, j) => (
                          <li key={j} className="flex gap-2 text-xs text-gray-600 leading-relaxed">
                            <span className="w-4 h-4 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center shrink-0 text-[9px]">
                              {j + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <button
              onClick={generateRecipes}
              className="w-full flex items-center justify-center gap-1.5 text-xs text-brand-600 font-semibold py-2 hover:text-brand-700"
            >
              <Loader2 size={12} className={loading ? 'animate-spin' : 'hidden'} />
              Generate different recipes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
