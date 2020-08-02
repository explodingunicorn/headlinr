import trends from '../data/trends';

export interface Trend {
  name: string;
  totalInteractions: number;
  positiveComments: number;
  negativeComments: number;
  totalScore: number;
  activeGroups: number;
}

export type TrendAddedOrRemoved = (trend: string) => void;
export type TrendsListChange = (trends: TrendTracker['trends']) => void;

export class TrendTracker {
  private trends: { [key: string]: Trend } = {};
  private trendPool = trends;
  private trendAddedSubscriptions: TrendAddedOrRemoved[] = [];
  private trendRemovedSubscriptions: TrendAddedOrRemoved[] = [];
  private trendsListChangeSubs: TrendsListChange[] = [];
  private trendsChangeSubs: TrendsListChange[] = [];

  public getSortedTrends() {
    return Object.keys(this.trends)
      .map((key) => {
        return this.trends[key];
      })
      .sort((a, b) => {
        if (a.totalInteractions > b.totalInteractions) {
          return -1;
        }
        return 1;
      });
  }

  public getRandomTrends() {
    this.trendPool.sort(function () {
      return 0.5 - Math.random();
    });
    return this.trendPool.slice(0, 5);
  }

  public getRandomTrend() {
    return this.trendPool[Math.floor(Math.random() * this.trendPool.length)];
  }

  public addTrend(trend: string) {
    const activeTrend = this.trends[trend];
    if (activeTrend) {
      activeTrend.activeGroups += 1;
    } else {
      this.trends[trend] = {
        name: trend,
        totalInteractions: 0,
        positiveComments: 0,
        negativeComments: 0,
        totalScore: 0,
        activeGroups: 1,
      };
      this.trendAddedSubscriptions.forEach((func) => {
        func(trend);
      });
      this.trendsListChangeSubs.forEach((func) => {
        func(this.trends);
      });
    }
  }

  public removeTrend(trend: string) {
    const trendData = this.trends[trend];
    if (trendData) {
      trendData.activeGroups -= 1;
      if (trendData.activeGroups === 0) {
        delete this.trends[trend];
        this.trendRemovedSubscriptions.forEach((func) => {
          func(trend);
        });
        this.trendsListChangeSubs.forEach((func) => {
          func(this.trends);
        });
      }
    }
  }

  public newComment(trend: string, type: 'positive' | 'negative') {
    const trendData = this.trends[trend];
    if (trendData) {
      trendData[
        type === 'positive' ? 'positiveComments' : 'negativeComments'
      ] += 1;
      trendData.totalInteractions += 1;
      this.trendsChangeSubs.forEach((sub) => {
        sub(this.trends);
      });
    }
  }

  public newReaction(trend: string, score: number) {
    const trendData = this.trends[trend];
    if (trendData) {
      trendData.totalScore += score;
      trendData.totalInteractions += 1;
      this.trendsChangeSubs.forEach((sub) => {
        sub(this.trends);
      });
    }
  }

  public onTrendAdded(func: TrendAddedOrRemoved) {
    this.trendAddedSubscriptions.push(func);
    return this;
  }

  public onTrendRemoved(func: TrendAddedOrRemoved) {
    this.trendRemovedSubscriptions.push(func);
    return this;
  }

  public onTrendsListChange(func: TrendsListChange) {
    this.trendsListChangeSubs.push(func);
    func(this.trends);
    return this;
  }

  public onTrendsChange(func: TrendsListChange) {
    this.trendsChangeSubs.push(func);
    return this;
  }
}
