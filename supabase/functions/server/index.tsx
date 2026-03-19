import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Route de test
app.get('/make-server-e5f33992/health', (c) => {
  return c.json({ status: 'ok' });
});

// Inscription
app.post('/make-server-e5f33992/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Error during signup: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.log(`Server error during signup: ${error}`);
    return c.json({ error: 'Server error during signup' }, 500);
  }
});

// Récupérer toutes les routines d'un utilisateur
app.get('/make-server-e5f33992/routines', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const routines = await kv.getByPrefix(`user:${user.id}:routine:`);
    return c.json({ routines });
  } catch (error) {
    console.log(`Error fetching routines: ${error}`);
    return c.json({ error: 'Error fetching routines' }, 500);
  }
});

// Créer une routine
app.post('/make-server-e5f33992/routines', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const routine = await c.req.json();
    const routineId = `routine_${Date.now()}`;
    const key = `user:${user.id}:routine:${routineId}`;
    
    await kv.set(key, { ...routine, id: routineId, userId: user.id, createdAt: new Date().toISOString() });
    
    return c.json({ routine: { ...routine, id: routineId } });
  } catch (error) {
    console.log(`Error creating routine: ${error}`);
    return c.json({ error: 'Error creating routine' }, 500);
  }
});

// Récupérer l'historique des exercices pour un utilisateur
app.get('/make-server-e5f33992/exercise-history', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const history = await kv.getByPrefix(`user:${user.id}:exercise:`);
    return c.json({ history });
  } catch (error) {
    console.log(`Error fetching exercise history: ${error}`);
    return c.json({ error: 'Error fetching exercise history' }, 500);
  }
});

// Sauvegarder une séance complétée
app.post('/make-server-e5f33992/sessions', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const session = await c.req.json();
    const sessionId = `session_${Date.now()}`;
    const key = `user:${user.id}:session:${sessionId}`;
    
    await kv.set(key, { ...session, id: sessionId, userId: user.id, completedAt: new Date().toISOString() });
    
    // Mettre à jour l'historique de chaque exercice
    for (const exercise of session.exercises) {
      const exerciseKey = `user:${user.id}:exercise:${exercise.name}`;
      await kv.set(exerciseKey, {
        name: exercise.name,
        lastSets: exercise.sets,
        restTime: exercise.restTime,
        note: exercise.note,
        updatedAt: new Date().toISOString()
      });
    }
    
    return c.json({ session: { ...session, id: sessionId } });
  } catch (error) {
    console.log(`Error saving session: ${error}`);
    return c.json({ error: 'Error saving session' }, 500);
  }
});

// Récupérer les données d'un exercice spécifique
app.get('/make-server-e5f33992/exercise/:name', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const exerciseName = c.req.param('name');
    const exerciseKey = `user:${user.id}:exercise:${exerciseName}`;
    const exerciseData = await kv.get(exerciseKey);
    
    return c.json({ exercise: exerciseData });
  } catch (error) {
    console.log(`Error fetching exercise data: ${error}`);
    return c.json({ error: 'Error fetching exercise data' }, 500);
  }
});

Deno.serve(app.fetch);
