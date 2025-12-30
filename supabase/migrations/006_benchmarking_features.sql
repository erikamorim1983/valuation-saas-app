-- Enable pgvector for AI Similarity (C)
create extension if not exists vector;

-- Add vector column for AI matching to valuations
-- This will store the embedding of the company description or business model
alter table valuations add column if not exists description_vector vector(1536); -- Standard size for OpenAI/Gemini embeddings

-- Market Benchmarks Table (A)
-- This stores data from external financial APIs
create table if not exists market_benchmarks (
    id uuid default gen_random_uuid() primary key,
    sector text not null,
    sub_sector text,
    revenue_multiple_avg numeric(10,2),
    ebitda_multiple_avg numeric(10,2),
    source text default 'Market Data API',
    last_updated timestamp with time zone default now()
);

-- Index for sector searches
create index if not exists idx_market_benchmarks_sector on market_benchmarks(sector);

-- Public/Aggregated Stats Function (D)
-- This allows users to see how they compare to others without exposing raw data
create or replace function get_sector_benchmarks(target_sector text)
returns table (
    avg_revenue_multiple numeric,
    avg_ebitda_multiple numeric,
    sample_size bigint
) language plpgsql security definer as $$
begin
    return query
    select 
        avg((valuation_result->'partnerValuation'->>'value')::numeric / nullif((financial_data->>'revenue')::numeric, 0))::numeric as avg_revenue_multiple,
        avg((valuation_result->'partnerValuation'->>'value')::numeric / nullif((financial_data->>'ebitda')::numeric, 0))::numeric as avg_ebitda_multiple,
        count(*)::bigint as sample_size
    from valuations
    where sector = target_sector
    and status = 'completed'
    and valuation_result is not null;
end;
$$;

-- AI Similarity Search Function (C)
-- Finds top 5 most similar businesses based on description
create or replace function match_similar_valuations(query_embedding vector(1536), match_threshold float, match_count int)
returns table (
    id uuid,
    company_name text,
    sector text,
    similarity float
)
language plpgsql security definer
as $$
begin
  return query
  select
    v.id,
    v.company_name,
    v.sector,
    1 - (v.description_vector <=> query_embedding) as similarity
  from valuations v
  where 1 - (v.description_vector <=> query_embedding) > match_threshold
  and v.status = 'completed'
  order by v.description_vector <=> query_embedding
  limit match_count;
end;
$$;

-- Initial Seed Data for Market Benchmarks (A)
-- These are typical industry multiples for 2024/2025
insert into market_benchmarks (sector, revenue_multiple_avg, ebitda_multiple_avg) values
('SaaS', 6.5, 22.0),
('E-commerce', 1.5, 8.5),
('Fintech', 8.0, 25.0),
('Services', 1.2, 5.0),
('Edtech', 4.5, 15.0),
('Healthcare', 3.5, 12.0)
on conflict do nothing;
