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

  public getRandomTrends() {
    this.trendPool.sort(function () {
      return 0.5 - Math.random();
    });
    return this.trendPool.slice(0, 5);
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
    }
  }

  public newReaction(trend: string, score: number) {
    const trendData = this.trends[trend];
    if (trendData) {
      trendData.totalScore += score;
      trendData.totalInteractions += 1;
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
    console.log('Getting sub for trends list');
    this.trendsListChangeSubs.push(func);
    func(this.trends);
  }
}
