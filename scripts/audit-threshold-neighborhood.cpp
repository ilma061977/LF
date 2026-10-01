#include <bits/stdc++.h>
using namespace std;
using Mask=uint32_t;

struct Variant {
  string id, family, formula;
  int featureA, sideA, thresholdA;
  int featureB, sideB, thresholdB;
};

// Metric IDs: 0=rotation90 matches, 1=main diagonal reflection,
// 2=anti-diagonal reflection, 3=diagonal density spread,
// 4=maximum diagonal occupancy ratio x100.
array<int,5> metrics(Mask m) {
  auto has=[&](int r,int c){ return bool(m & (Mask(1) << (r*5+c))); };
  int rot=0, main=0, anti=0;
  for(int r=0;r<5;r++) for(int c=0;c<5;c++) {
    rot += has(r,c)==has(c,4-r);
    main += has(r,c)==has(c,r);
    anti += has(r,c)==has(4-c,4-r);
  }
  int dmin=10000,dmax=-10000;
  for(int r=0;r<5;r++) for(int c=0;c<5;c++) {
    if(r==0||c==0) {
      int count=0,len=0;
      for(int k=0;r+k<5&&c+k<5;k++){count+=has(r+k,c+k);len++;}
      if(len>=2){int ratio=(count*100+len/2)/len;dmin=min(dmin,ratio);dmax=max(dmax,ratio);}
    }
    if(r==0||c==4) {
      int count=0,len=0;
      for(int k=0;r+k<5&&c-k>=0;k++){count+=has(r+k,c-k);len++;}
      if(len>=2){int ratio=(count*100+len/2)/len;dmin=min(dmin,ratio);dmax=max(dmax,ratio);}
    }
  }
  return {rot,main,anti,dmax-dmin,dmax};
}

bool matches(int value,int side,int threshold) { return side==0 ? value>=threshold : value<=threshold; }

int main(int argc,char**argv) {
  const string outPath=argc>1?argv[1]:"auditoria/threshold-neighborhood-masks.csv";
  vector<Variant> v;
  auto add=[&](string id,string family,string formula,int fa,int sa,int ta,int fb,int sb,int tb){
    v.push_back({id,family,formula,fa,sa,ta,fb,sb,tb});
  };
  auto label=[](int side){return side==0?">=":"<=";};
  for(int t:{65,70,73,75,77,80,85})
    add("N01_MAXDIAG_"+to_string(t),"N01","rotation90_matches >= 17 E max_diagonal_occupancy_ratio_x100 <= "+to_string(t),0,0,17,4,1,t);
  for(int t:{5,6,7,8,9})
    add("N02_MAIN_"+to_string(t),"N02","reflection_main_diagonal_matches <= "+to_string(t)+" E reflection_anti_diagonal_matches >= 21",1,1,t,2,0,21);
  for(int t:{17,19,21,23,25})
    add("N02_ANTI_"+to_string(t),"N02","reflection_main_diagonal_matches <= 7 E reflection_anti_diagonal_matches >= "+to_string(t),1,1,7,2,0,t);
  for(int t:{43,45,47,48,49,50,51,52,53,55})
    add("N03_SPREAD_"+to_string(t),"N03_N04","rotation90_matches >= 17 E diagonal_density_spread <= "+to_string(t),0,0,17,3,1,t);
  for(int t:{5,6,7,8,9})
    add("N05_MAIN_"+to_string(t),"N05","reflection_main_diagonal_matches <= "+to_string(t)+" E reflection_anti_diagonal_matches <= 9",1,1,t,2,1,9);
  for(int t:{5,7,8,9,10,11,13})
    add("N05_ANTI_"+to_string(t),"N05","reflection_main_diagonal_matches <= 7 E reflection_anti_diagonal_matches <= "+to_string(t),1,1,7,2,1,t);

  ofstream out(outPath);
  if(!out) throw runtime_error("Não foi possível gravar o arquivo de máscaras.");
  out<<"id,mask\n";
  long long total=0;
  auto rec=[&](auto&&self,Mask m,int start,int left)->void {
    if(!left) {
      const auto f=metrics(m);
      for(const auto &q:v) if(matches(f[q.featureA],q.sideA,q.thresholdA)&&matches(f[q.featureB],q.sideB,q.thresholdB)) {
        out<<q.id<<','<<m<<'\n'; total++;
      }
      return;
    }
    for(int i=start;i<=26-left;i++) self(self,m|(Mask(1)<<(i-1)),i+1,left-1);
  };
  rec(rec,0,1,15);
  cerr<<"universe=3268760 variants="<<v.size()<<" emitted_masks="<<total<<"\n";
}
